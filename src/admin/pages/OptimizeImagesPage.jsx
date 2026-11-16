import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createOptimizedVersions } from '@/utils/imageResize';

export default function OptimizeImagesPage() {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);

  const optimizeExistingImages = async () => {
    setStatus('running');
    setResults([]);
    
    try {
      // Fetch mockups without thumbnail_url
      const { data: mockups, error: fetchError } = await supabase
        .from('mockups')
        .select('id, title, image_url, cover_image_url, desktop_screenshot_url')
        .is('thumbnail_url', null)
        .order('id');

      if (fetchError) throw fetchError;
      
      if (!mockups || mockups.length === 0) {
        setStatus('complete');
        setResults([{ id: 'none', title: 'All mockups already optimized', status: 'success' }]);
        return;
      }

      setProgress({ current: 0, total: mockups.length });

      for (let i = 0; i < mockups.length; i++) {
        const mockup = mockups[i];
        setProgress({ current: i + 1, total: mockups.length });

        try {
          // Find the image URL to optimize
          const sourceUrl = mockup.desktop_screenshot_url || mockup.cover_image_url || mockup.image_url;
          
          if (!sourceUrl) {
            setResults(prev => [...prev, { 
              id: mockup.id, 
              title: mockup.title, 
              status: 'skipped',
              message: 'No image found'
            }]);
            continue;
          }

          // Download the image
          const response = await fetch(sourceUrl);
          if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
          
          const blob = await response.blob();
          const originalSize = blob.size;
          
          // Create File object
          const file = new File([blob], 'image.png', { type: blob.type });
          
          // Create optimized versions
          const { card, full } = await createOptimizedVersions(file);
          
          // Upload card thumbnail
          const cardFileName = `mockup-${mockup.id}-card-${Date.now()}.webp`;
          const { error: cardUploadError } = await supabase.storage
            .from('mockups')
            .upload(cardFileName, card.blob, {
              contentType: 'image/webp',
              upsert: false
            });

          if (cardUploadError) throw cardUploadError;

          const { data: { publicUrl: cardUrl } } = supabase.storage
            .from('mockups')
            .getPublicUrl(cardFileName);

          // Upload full image if we don't have desktop_screenshot_url
          let fullUrl = mockup.desktop_screenshot_url;
          if (!fullUrl) {
            const fullFileName = `mockup-${mockup.id}-full-${Date.now()}.webp`;
            const { error: fullUploadError } = await supabase.storage
              .from('mockups')
              .upload(fullFileName, full.blob, {
                contentType: 'image/webp',
                upsert: false
              });

            if (fullUploadError) throw fullUploadError;

            const { data: { publicUrl } } = supabase.storage
              .from('mockups')
              .getPublicUrl(fullFileName);
            fullUrl = publicUrl;
          }

          // Update database
          const { error: updateError } = await supabase
            .from('mockups')
            .update({ 
              thumbnail_url: cardUrl,
              desktop_screenshot_url: fullUrl
            })
            .eq('id', mockup.id);

          if (updateError) throw updateError;

          const savedKB = Math.round((originalSize - card.size) / 1024);
          setResults(prev => [...prev, {
            id: mockup.id,
            title: mockup.title,
            status: 'success',
            originalKB: Math.round(originalSize / 1024),
            cardKB: Math.round(card.size / 1024),
            savedKB
          }]);

        } catch (err) {
          setResults(prev => [...prev, {
            id: mockup.id,
            title: mockup.title,
            status: 'error',
            message: err.message
          }]);
        }
      }

      setStatus('complete');
    } catch (err) {
      setStatus('error');
      setResults(prev => [...prev, {
        id: 'error',
        title: 'Fatal error',
        status: 'error',
        message: err.message
      }]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Optimize Mockup Images</h1>
        
        <div className="bg-surface-container rounded-lg p-6 mb-6">
          <p className="mb-4">
            This tool will download existing mockup images, create optimized WebP versions (640px card + 1600px full), 
            upload them to storage, and update the database with thumbnail URLs.
          </p>
          
          <button
            onClick={optimizeExistingImages}
            disabled={status === 'running'}
            className="px-6 py-3 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50"
          >
            {status === 'running' ? 'Optimizing...' : 'Start Optimization'}
          </button>

          {status === 'running' && (
            <div className="mt-4">
              <div className="text-sm mb-2">
                Progress: {progress.current} / {progress.total}
              </div>
              <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-surface-container rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-variant">
                <tr>
                  <th className="px-4 py-3 text-left">ID</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Original</th>
                  <th className="px-4 py-3 text-right">Card</th>
                  <th className="px-4 py-3 text-right">Saved</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result, idx) => (
                  <tr key={`${result.id}-${idx}`} className="border-t border-outline-variant">
                    <td className="px-4 py-3">{result.id}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{result.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.status === 'success' ? 'bg-tertiary-container text-on-tertiary-container' :
                        result.status === 'error' ? 'bg-error-container text-on-error-container' :
                        'bg-surface-variant text-on-surface-variant'
                      }`}>
                        {result.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{result.originalKB ? `${result.originalKB}KB` : '-'}</td>
                    <td className="px-4 py-3 text-right">{result.cardKB ? `${result.cardKB}KB` : '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-tertiary">
                      {result.savedKB ? `↓ ${result.savedKB}KB` : result.message || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {status === 'complete' && (
          <div className="mt-6 p-4 bg-tertiary-container text-on-tertiary-container rounded-lg">
            ✓ Optimization complete! Total: {results.length} images processed.
          </div>
        )}
      </div>
    </div>
  );
}
