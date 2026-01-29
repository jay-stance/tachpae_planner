'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Upload, Check, X, Play, AlertCircle, ChevronLeft, ChevronRight, Pause, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvent } from '@/context/EventContext';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductConfiguratorProps {
  product: Product;
  onComplete: (configuration: any) => void;
}

const isVideo = (url: string) => {
  return url.match(/\.(mp4|webm|ogg|mov)$/i);
};

export default function ProductConfigurator({ product, onComplete }: ProductConfiguratorProps) {
  const { event } = useEvent();
  const primaryColor = event?.themeConfig?.primaryColor || '#e11d48';
  
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [customizationData, setCustomizationData] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, { url: string; type: string }[]>>({});
  const [mediaError, setMediaError] = useState<string | null>(null);
  
  // Gallery & Lightbox State
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const steps = product.customizationSchema?.steps || [];
  const hasVariants = product.variantsConfig?.options && product.variantsConfig.options.length > 0;
  const hasWizard = steps.length > 0;
  
  // Consolidated Media
  const mediaGallery = product.mediaGallery?.filter(Boolean) || [];

  // Video constraints
  const globalMaxDuration = product.videoConfig?.maxDuration || 10;
  const globalMaxSize = product.videoConfig?.maxSize || 50;

  const handleMediaNav = (direction: 'next' | 'prev') => {
    setIsPlaying(false);
    if (direction === 'next') {
        setCurrentMediaIndex((prev) => (prev + 1) % mediaGallery.length);
    } else {
        setCurrentMediaIndex((prev) => (prev - 1 + mediaGallery.length) % mediaGallery.length);
    }
  };

  const toggleVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }
  };

  const openLightbox = (index: number) => {
    setCurrentMediaIndex(index);
    setLightboxOpen(true);
  };

  const renderLightbox = () => {
    if (!lightboxOpen) return null;

    const currentMedia = mediaGallery[currentMediaIndex];
    const isCurrentVideo = isVideo(currentMedia);

    return (
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button 
              className="absolute top-6 right-6 px-4 py-2 bg-white text-gray-900 rounded-full font-bold shadow-xl hover:bg-gray-100 transition-all z-50 flex items-center gap-2 active:scale-95"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>

            <div 
              className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
               {isCurrentVideo ? (
                  <video 
                    src={currentMedia} 
                    controls 
                    className="max-w-full max-h-full rounded-lg shadow-2xl" 
                    autoPlay
                  />
               ) : (
                  <img 
                    src={currentMedia} 
                    alt="Full screen view" 
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
               )}

               {/* Navigation */}
               {mediaGallery.length > 1 && (
                 <>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleMediaNav('prev'); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleMediaNav('next'); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                    
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
                        {mediaGallery.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(idx); }}
                                className={cn(
                                    "w-2.5 h-2.5 rounded-full transition-all",
                                    idx === currentMediaIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
                                )}
                            />
                        ))}
                    </div>
                 </>
               )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderGallery = () => {
    if (mediaGallery.length === 0) return null;

    const currentMedia = mediaGallery[currentMediaIndex];
    const isCurrentVideo = isVideo(currentMedia);

    return (
        <>
            {/* Main Gallery - Square aspect ratio, balanced for mobile */}
            <div className="relative w-full bg-gray-100 group" style={{ aspectRatio: '1/1' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentMedia}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 flex items-center justify-center cursor-zoom-in"
                        onClick={() => openLightbox(currentMediaIndex)}
                    >
                        {isCurrentVideo ? (
                            <div className="relative w-full h-full bg-black flex items-center justify-center" onClick={toggleVideo}>
                                <video
                                    ref={videoRef}
                                    src={currentMedia}
                                    className="w-full h-full object-contain"
                                    loop
                                    playsInline
                                    muted={isMuted}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                />
                                {!isPlaying && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/10 transition-colors cursor-pointer">
                                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center pl-1 shadow-xl">
                                            <Play className="w-6 h-6 text-white fill-white" />
                                        </div>
                                    </div>
                                )}
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                    className="absolute bottom-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                                >
                                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                            </div>
                        ) : (
                            <img src={currentMedia} alt={product.name} className="w-full h-full object-cover" />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation - Always visible when multiple */}
                {mediaGallery.length > 1 && (
                    <>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleMediaNav('prev'); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white transition-all z-10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleMediaNav('next'); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center text-gray-700 hover:bg-white transition-all z-10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        
                        {/* Dots + Counter at bottom */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/50 backdrop-blur-sm z-10">
                            {mediaGallery.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(idx); setIsPlaying(false); }}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        idx === currentMediaIndex ? "bg-white" : "bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
            {renderLightbox()}
        </>
    );
  };



  const handleVariantSelect = (optionName: string, value: any) => {
    setSelectedVariants(prev => ({ ...prev, [optionName]: value }));
  };

  const handleWizardInput = (fieldName: string, value: any) => {
    setCustomizationData(prev => ({ ...prev, [fieldName]: value }));
  };

  // ... (validateFile and handleFileUpload logic remains the same, inserting strict ref here would be too long so keeping original logic via existing code block pattern match if possible, or just rewriting it since I have to replace the whole file or large chunks)
  // To keep it simple and safe, I will rewrite the component structure but keep the helper logic.
  
  const validateFile = (file: File, field: any): Promise<boolean> => {
    return new Promise((resolve) => {
      // Size validation
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > globalMaxSize) {
        setMediaError(`File "${file.name}" is too large! Maximum ${globalMaxSize}MB allowed.`);
        resolve(false);
        return;
      }

      // Type check
      const isVideoType = file.type.startsWith('video/');
      const isImageType = file.type.startsWith('image/');

      if (isVideoType) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          if (video.duration > globalMaxDuration) {
            setMediaError(`Video "${file.name}" is too long! Maximum ${globalMaxDuration} seconds allowed.`);
            resolve(false);
          } else {
            resolve(true);
          }
        };
        video.onerror = () => resolve(false);
        video.src = URL.createObjectURL(file);
      } else if (isImageType) {
        resolve(true);
      } else {
        setMediaError(`File type for "${file.name}" not supported.`);
        resolve(false);
      }
    });
  };

  const handleFileUpload = async (fieldName: string, files: FileList | File[]) => {
    setMediaError(null);
    const field = steps[currentStep]?.fields.find(f => f.name === fieldName);
    if (!field) return;

    const currentFiles = customizationData[fieldName] || [];
    const maxImages = field.maxImages || (field.accept?.includes('image') ? 1 : 0);
    const maxVideos = field.maxVideos || (field.accept?.includes('video') ? 1 : 0);
    const maxTotal = (maxImages || 0) + (maxVideos || 0);

    const newFiles = Array.from(files);
    const updatedFiles = [...currentFiles];
    const updatedPreviews = [...(filePreviews[fieldName] || [])];

    for (const file of newFiles) {
        if (updatedFiles.length >= maxTotal && maxTotal > 0) {
            setMediaError(`Maximum ${maxTotal} files allowed for this field.`);
            break;
        }

        const isVideoType = file.type.startsWith('video/');
        const isImageType = file.type.startsWith('image/');

        // Check specific limits
        if (isImageType) {
            const currentImages = updatedFiles.filter((f: any) => f.type.startsWith('image/')).length;
            if (maxImages && currentImages >= maxImages) {
                setMediaError(`Maximum ${maxImages} images allowed.`);
                continue;
            }
        }

        if (isVideoType) {
            const currentVideos = updatedFiles.filter((f: any) => f.type.startsWith('video/')).length;
            if (maxVideos && currentVideos >= maxVideos) {
                setMediaError(`Maximum ${maxVideos} videos allowed.`);
                continue;
            }
        }

        const isValid = await validateFile(file, field);
        if (isValid) {
            updatedFiles.push(file);
            updatedPreviews.push({
                url: URL.createObjectURL(file),
                type: file.type
            });
        }
    }

    handleWizardInput(fieldName, updatedFiles);
    setFilePreviews(prev => ({ ...prev, [fieldName]: updatedPreviews }));
  };

  const removeFile = (fieldName: string, index: number) => {
    const updatedFiles = [...(customizationData[fieldName] || [])];
    const updatedPreviews = [...(filePreviews[fieldName] || [])];
    
    if (updatedPreviews[index]) {
      URL.revokeObjectURL(updatedPreviews[index].url);
    }
    
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    
    handleWizardInput(fieldName, updatedFiles);
    setFilePreviews(prev => ({ ...prev, [fieldName]: updatedPreviews }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateTotalPrice = () => {
    let total = product.basePrice;
    Object.values(selectedVariants).forEach((variant: any) => {
      if (variant?.priceModifier) {
        total += variant.priceModifier;
      }
    });
    return total;
  };

  const handleComplete = () => {
    onComplete({
      variants: selectedVariants,
      wizardData: customizationData,
      totalPrice: calculateTotalPrice(),
    });
  };

  const renderVariants = () => {
    // ... (rest of the component logic remains essentially the same as previous step, just re-declaring to ensure full file content)
    // For brevity in this replacement block, I'll paste the logic exactly as it was but ensure it's inside the export.
    if (!hasVariants) return null;

    return (
      <div className="space-y-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Customize your Item</h3>
        {product.variantsConfig?.options.map((option, idx) => (
          <div key={idx} className="space-y-3">
            <label className="text-sm font-medium text-gray-500">{option.name}</label>
            <div className="flex flex-wrap gap-3">
              {option.values.map((val, vIdx) => {
                const isSelected = selectedVariants[option.name]?.value === val.value;
                return (
                  <button
                    key={vIdx}
                    onClick={() => handleVariantSelect(option.name, val)}
                    className={cn(
                      "relative px-4 py-2.5 rounded-xl border-2 transition-all font-medium",
                      isSelected 
                        ? "border-current bg-opacity-10 shadow-sm" 
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}
                    style={isSelected ? { borderColor: primaryColor, color: primaryColor, backgroundColor: `${primaryColor}10` } : {}}
                  >
                    <span className="text-sm">{val.label}</span>
                    {val.priceModifier ? (
                      <span className="text-xs ml-1 opacity-70">(+₦{val.priceModifier.toLocaleString()})</span>
                    ) : null}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderWizardStep = () => {
    const step = steps[currentStep];
    if (!step) return null;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="mb-4">
          <h4 className="text-xl font-bold" style={{ color: primaryColor }}>{step.title}</h4>
          <div className="flex gap-1 mt-3">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className="h-1.5 flex-1 rounded-full transition-colors" 
                style={{ backgroundColor: i <= currentStep ? primaryColor : '#e5e7eb' }} 
              />
            ))}
          </div>
        </div>

        {step.fields.map((field: any, idx: number) => (
          <div key={idx} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'text' && (
              <Input 
                value={customizationData[field.name] || ''}
                onChange={(e) => handleWizardInput(field.name, e.target.value)}
                placeholder={`Enter ${field.label}`}
                className="h-12 rounded-xl"
              />
            )}

            {field.type === 'file' && (
              <div className="space-y-3">
                {/* Constraint Info */}
                <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  Max {field.maxVideos || (field.accept?.includes('video') ? 1 : 0)} video(s), {field.maxImages || (field.accept?.includes('image') ? 1 : 0)} image(s) ({globalMaxDuration}s max)
                </div>
                
                {/* File List / Previews */}
                {(customizationData[field.name]?.length > 0) && (
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {filePreviews[field.name]?.map((preview: any, pIdx: number) => (
                      <div key={pIdx} className="relative group aspect-square rounded-xl overflow-hidden bg-black border border-gray-100">
                        {preview.type.startsWith('video/') ? (
                          <video 
                            src={preview.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            onMouseOver={e => e.currentTarget.play()}
                            onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                        ) : (
                          <img 
                            src={preview.url}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button 
                          onClick={() => removeFile(field.name, pIdx)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                  <label htmlFor={`file-${field.name}`} className="block p-8 cursor-pointer hover:bg-gray-100/50 transition-colors">
                    <Upload className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 text-center mb-4">
                      {customizationData[field.name]?.length > 0 ? 'Add more files' : 'Click to upload or drag and drop'}
                    </p>
                    <div className="flex justify-center">
                      <div 
                        className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white shadow cursor-pointer"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <Play className="w-4 h-4 mr-2" /> Select File(s)
                      </div>
                    </div>
                    <input 
                      type="file" 
                      multiple={((field.maxImages || 0) + (field.maxVideos || 0)) > 1}
                      accept={field.accept}
                      className="hidden" 
                      id={`file-${field.name}`}
                      onChange={(e) => {
                        if (e.target.files) handleFileUpload(field.name, e.target.files);
                      }}
                    />
                  </label>
                </div>

                {/* Error Message */}
                {mediaError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {mediaError}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Gallery Section - Fixed width on desktop */}
        <div className="md:w-[45%] md:max-h-[90vh] md:overflow-hidden flex-shrink-0">
          {renderGallery()}
        </div>

      {/* Right Side: Content + Footer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          {/* Product Header */}
          <div className="mb-6 pb-6 border-b border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-2">{product.name}</h2>
            <p className="text-gray-500 text-sm font-medium leading-relaxed">{product.description}</p>
            <div className="mt-4 flex items-center gap-2">
               <span className="text-xl font-black" style={{ color: primaryColor }}>₦{product.basePrice.toLocaleString()}</span>
               {product.tierLabel && (
                 <span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider">
                   {product.tierLabel}
                 </span>
               )}
            </div>
          </div>

          {/* Phase 1: Variants */}
          {(!hasWizard || currentStep === 0) && renderVariants()}

          {/* Phase 2: Wizard Steps */}
          {hasWizard && renderWizardStep()}

          {!hasWizard && (
            <div className="mt-6 pt-4 border-t flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                  ₦{calculateTotalPrice().toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-6 md:px-8 md:py-6 border-t bg-gray-50/50 backdrop-blur-sm z-20">
          {hasWizard ? (
            <div className="flex justify-between items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={currentStep === 0}
                className={cn("rounded-full", currentStep === 0 ? "invisible" : "visible")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              <div className="text-center hidden sm:block">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">Total Price</div>
                <div className="text-xl font-bold" style={{ color: primaryColor }}>
                  ₦{calculateTotalPrice().toLocaleString()}
                </div>
              </div>
              
              <Button 
                onClick={nextStep} 
                className="rounded-full px-8 h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                {currentStep === steps.length - 1 ? 'Add to Bundle' : 'Next Step'}
                {currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-end">
              <Button 
                onClick={handleComplete} 
                className="rounded-full px-10 h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-lg shadow-rose-200 transition-all active:scale-95"
              >
                Add to Bundle <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

