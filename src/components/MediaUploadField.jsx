import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, File as FileIcon, AlertCircle, Check, Loader2, ExternalLink, ChevronDown } from 'lucide-react';
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

  // Resize image in browser - fail-safe with multiple fallbacks
  const resizeImage = (file, maxWidth = 1920) => {
    return new Promise((resolve, reject) => {
      // Don't resize SVG or GIF (could be animated)
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
        resolve(file);
        return;
      }

      // Skip processing for small files (< 300KB)
      if (file.size < 300 * 1024) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      const timeoutId = setTimeout(() => reject(new Error('Read timeout')), 8000);
      
      reader.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Failed to read file'));
      };

      reader.onload = (e) => {
        clearTimeout(timeoutId);
        const img = new Image();
        const imgTimeoutId = setTimeout(() => reject(new Error('Load timeout')), 8000);
        
        img.onerror = () => {
          clearTimeout(imgTimeoutId);
          reject(new Error('Failed to load image'));
        };
        
        img.onload = () => {
          clearTimeout(imgTimeoutId);
          
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            // Only resize if actually larger
            if (width <= maxWidth) {
              resolve(file);
              return;
            }

            height = (height * maxWidth) / width;
            width = maxWidth;
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);

            const blobTimeoutId = setTimeout(() => reject(new Error('Convert timeout')), 8000);
            canvas.toBlob(
              (blob) => {
                clearTimeout(blobTimeoutId);
                if (!blob || blob.size >= file.size) {
                  resolve(file);
                  return;
                }
                resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), {
                  type: 'image/webp',
                }));
              },
              'image/webp',
              0.85
            );
          } catch (err) {
            reject(err);
          }
        };
        
        img.src = e.target.result;
      };
      
      reader.readAsDataURL(file);
    });
  };

  // Handle file upload with timeout and proper error handling
  const handleFileUpload = async (file) => {
    setValidationError('');
    let progressInterval = null;
    let uploadAborted = false;
    
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

      // Try to process images (resize/convert to WebP), but ALWAYS fall back to original if it fails
      if (fileType === 'image' && file.type !== 'image/svg+xml' && file.type !== 'image/gif') {
        setProgress(5); // Show we're starting
        try {
          // Short timeout for processing: 8 seconds
          processedFile = await Promise.race([
            resizeImage(file),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Processing timeout')), 8000)
            )
          ]);
          setProgress(15);
          console.log('✓ Image processed successfully');
        } catch (processingError) {
          console.warn('⚠ Image processing failed, uploading original:', processingError.message);
          // Fall back to original file - ALWAYS continue with upload
          processedFile = file;
          setProgress(15);
          // Don't show error toast - processing failure is not a critical error
        }
      } else {
        setProgress(15); // Skip processing for videos/SVG/GIF
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const ext = processedFile.name.split('.').pop();
      const filename = `${timestamp}-${randomStr}.${ext}`;
      const filePath = `${fileType}s/${filename}`;

      console.log('Starting upload:', filePath, processedFile.size, 'bytes');

      // Show realistic upload progress (can't get real progress from Supabase SDK)
      let currentProgress = 15;
      progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 8, 85);
        setProgress(currentProgress);
      }, 800);

      // Upload to Supabase Storage with timeout (60s for large files)
      const uploadTimeout = fileType === 'video' ? 120000 : 60000; // 2min for video, 1min for others
      const publicUrl = await Promise.race([
        uploadFile('site-media', filePath, processedFile),
        new Promise((_, reject) => 
          setTimeout(() => {
            uploadAborted = true;
            reject(new Error(`Upload timeout (${uploadTimeout / 1000}s). File may be too large.`));
          }, uploadTimeout)
        )
      ]);

      if (progressInterval) {
        clearInterval(progressInterval);
      }
      setProgress(100);
      
      console.log('✓ Upload successful:', publicUrl);

      // Get image dimensions if it's an image
      if (fileType === 'image') {
        const img = new Image();
        img.onload = () => {
          setFileInfo({
            name: file.name,
            size: file.size,
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = () => {
          // Still set file info even if preview fails
          setFileInfo({
            name: file.name,
            size: file.size,
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
      console.error('❌ Upload error:', error);
      
      // Parse Supabase storage errors for user-friendly messages
      let errorMessage = error.message || 'Failed to upload file. Please try again.';
      
      if (uploadAborted) {
        errorMessage = 'Upload timed out. Please try a smaller file or check your connection.';
      } else if (error.message?.includes('bucket') || error.message?.includes('not found')) {
        errorMessage = 'Storage not configured. Please ensure the site-media bucket exists.';
      } else if (error.message?.includes('policy') || error.message?.includes('permission') || error.message?.includes('row-level security')) {
        errorMessage = 'Permission denied. Please ensure you are logged in as admin.';
      } else if (error.message?.includes('size') || error.message?.includes('large') || error.message?.includes('payload')) {
        errorMessage = `File too large. Maximum size: ${(maxFileSize / (1024 * 1024)).toFixed(0)}MB`;
      } else if (error.message?.includes('type') || error.message?.includes('MIME')) {
        errorMessage = 'Invalid file type. Please check the allowed formats.';
      } else if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        errorMessage = 'File already exists. Please try again (new filename will be generated).';
      }
      
      setValidationError(errorMessage);
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
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
    if (fileType === 'video') return <VideoIcon className="w-6 h-6" />;
    if (fileType === 'document') return <FileIcon className="w-6 h-6" />;
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
                    <FileIcon className="w-8 h-8 text-primary" />
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
