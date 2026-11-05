import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video, File, AlertCircle, Check, Loader2, ExternalLink, ChevronDown } from 'lucide-react';
import { uploadFile, deleteFile } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const FILE_SIZE_LIMITS = {
  image: 5 * 1024 * 1024, // 5MB
  video: 50 * 1024 * 1024, // 50MB
  document: 10 * 1024 * 1024, // 10MB
};

const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'],
  video: ['video/mp4', 'video/webm'],
  document: ['application/pdf', 'application/zip'],
};

const MediaUploadField = ({
  label,
  value,
  onChange,
  accept = 'image/*',
  maxSize,
  required = false,
  showAltText = false,
  altText = '',
  onAltTextChange,
  helperText,
  fileType = 'image', // 'image', 'video', 'document'
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState(value || null);
  const [fileInfo, setFileInfo] = useState(null);
  const [showExternalUrl, setShowExternalUrl] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  const maxFileSize = maxSize || FILE_SIZE_LIMITS[fileType];
  const allowedTypes = ALLOWED_TYPES[fileType] || ALLOWED_TYPES.image;

  // Validate file
  const validateFile = (file) => {
    if (!allowedTypes.includes(file.type)) {
      const typeNames = fileType === 'image' ? 'JPG, PNG, WebP, GIF, SVG' :
                        fileType === 'video' ? 'MP4, WebM' :
                        'PDF, ZIP';
      return `Invalid file type. Allowed: ${typeNames}`;
    }

    if (file.size > maxFileSize) {
      const sizeMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      return `File too large. Maximum size: ${sizeMB}MB`;
    }

    return null;
  };

  // Resize image in browser
  const resizeImage = (file, maxWidth = 1920) => {
    return new Promise((resolve) => {
      // Don't resize SVG
      if (file.type === 'image/svg+xml') {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                type: 'image/webp',
              }));
            },
            'image/webp',
            0.9
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    setValidationError('');
    
    // Validate
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      toast({
        title: 'Invalid file',
        description: error,
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let processedFile = file;

      // Resize images
      if (fileType === 'image' && file.type !== 'image/svg+xml') {
        processedFile = await resizeImage(file);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = processedFile.name.split('.').pop();
      const filename = `${timestamp}-${randomStr}.${ext}`;
      const filePath = `${fileType}s/${filename}`;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload to Supabase Storage
      const publicUrl = await uploadFile('site-media', filePath, processedFile);

      clearInterval(progressInterval);
      setProgress(100);

      // Get image dimensions if it's an image
      if (fileType === 'image') {
        const img = document.createElement('img');
        img.onload = () => {
          setFileInfo({
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
          });
        };
        img.src = URL.createObjectURL(processedFile);
      } else {
        setFileInfo({
          name: file.name,
          size: file.size,
        });
      }

      setPreview(publicUrl);
      onChange(publicUrl);

      toast({
        title: 'Upload successful',
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  // Handle remove
  const handleRemove = async () => {
    if (!preview) return;

    // Extract path from URL if it's from our storage
    if (preview.includes('supabase')) {
      try {
        const url = new URL(preview);
        const pathMatch = url.pathname.match(/\/site-media\/(.*)/);
        if (pathMatch) {
          await deleteFile('site-media', pathMatch[1]);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    setPreview(null);
    setFileInfo(null);
    onChange('');
    if (onAltTextChange) onAltTextChange('');
  };

  // Handle external URL
  const handleExternalUrlSubmit = () => {
    if (externalUrl.trim()) {
      setPreview(externalUrl);
      onChange(externalUrl);
      setShowExternalUrl(false);
      setExternalUrl('');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getIcon = () => {
    if (fileType === 'video') return <Video className="w-6 h-6" />;
    if (fileType === 'document') return <File className="w-6 h-6" />;
    return <ImageIcon className="w-6 h-6" />;
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-text-primary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Upload Area */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? 'border-primary bg-primary/10 scale-[1.02]' 
              : 'border-frost bg-frost-soft hover:border-primary/50 hover:bg-frost'
            }
            ${validationError ? 'border-red-500' : ''}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            aria-label={label}
          />

          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-full ${isDragging ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                getIcon()
              )}
            </div>

            {uploading ? (
              <div className="w-full max-w-xs space-y-2">
                <p className="text-sm font-medium text-text-primary">Uploading...</p>
                <div className="h-2 bg-frost rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-xs text-text-muted">{progress}%</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {fileType === 'image' && 'JPG, PNG, WebP, GIF, SVG (max 5MB)'}
                    {fileType === 'video' && 'MP4, WebM (max 50MB)'}
                    {fileType === 'document' && 'PDF, ZIP (max 10MB)'}
                  </p>
                </div>

                {validationError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationError}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ) : (
        // Preview
        <div className="space-y-3">
          <div className="relative border border-frost rounded-xl p-4 bg-background">
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="flex-shrink-0">
                {fileType === 'image' ? (
                  <img
                    src={preview}
                    alt={altText || 'Preview'}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                ) : fileType === 'video' ? (
                  <video
                    src={preview}
                    className="w-24 h-24 object-cover rounded-lg"
                    controls
                  />
                ) : (
                  <div className="w-24 h-24 bg-frost rounded-lg flex items-center justify-center">
                    <File className="w-8 h-8 text-primary" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {fileInfo && (
                  <>
                    <p className="text-sm font-medium text-text-primary truncate">
                      {fileInfo.name}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      {formatFileSize(fileInfo.size)}
                      {fileInfo.width && fileInfo.height && (
                        <> • {fileInfo.width} × {fileInfo.height}px</>
                      )}
                    </p>
                  </>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-green-600">Uploaded</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  aria-label="Replace file"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRemove}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Alt Text for Images */}
          {showAltText && fileType === 'image' && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Alt Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => onAltTextChange?.(e.target.value)}
                placeholder="Describe this image for accessibility"
                className="w-full px-4 py-2.5 bg-background border border-frost rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                required={showAltText}
              />
              {!altText && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Alt text is required for accessibility
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* External URL Option */}
      {!uploading && (
        <div>
          <button
            type="button"
            onClick={() => setShowExternalUrl(!showExternalUrl)}
            className="text-xs text-text-muted hover:text-primary flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Advanced: Use external URL
            <ChevronDown className={`w-3 h-3 transition-transform ${showExternalUrl ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showExternalUrl && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="flex-1 px-3 py-2 text-sm bg-background border border-frost rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={handleExternalUrlSubmit}
                    className="px-4 py-2 bg-primary-strong text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                  >
                    Use
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-text-muted">{helperText}</p>
      )}

      {/* Hidden input for form submission */}
      <input type="hidden" value={preview || ''} />
    </div>
  );
};

export default MediaUploadField;
