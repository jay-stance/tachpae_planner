'use client';

import React, { useState, useRef } from 'react';
import { IProduct } from '@/models/Product';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowRight, ArrowLeft, Upload, Check, X, Play, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvent } from '@/context/EventContext';

interface ProductConfiguratorProps {
  product: IProduct;
  onComplete: (configuration: any) => void;
}

export default function ProductConfigurator({ product, onComplete }: ProductConfiguratorProps) {
  const { event } = useEvent();
  const primaryColor = event?.themeConfig?.primaryColor || '#e11d48';
  
  const [selectedVariants, setSelectedVariants] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [customizationData, setCustomizationData] = useState<Record<string, any>>({});
  const [filePreviews, setFilePreviews] = useState<Record<string, { url: string; type: string }[]>>({});
  const [mediaError, setMediaError] = useState<string | null>(null);
  
  const steps = product.customizationSchema?.steps || [];
  const hasVariants = product.variantsConfig?.options?.length > 0;
  const hasWizard = steps.length > 0;

  // Video constraints from product config or defaults
  const globalMaxDuration = (product as any).videoConfig?.maxDuration || 10; // seconds
  const globalMaxSize = (product as any).videoConfig?.maxSize || 50; // MB

  const handleVariantSelect = (optionName: string, value: any) => {
    setSelectedVariants(prev => ({ ...prev, [optionName]: value }));
  };

  const handleWizardInput = (fieldName: string, value: any) => {
    setCustomizationData(prev => ({ ...prev, [fieldName]: value }));
  };

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
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      if (isVideo) {
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
      } else if (isImage) {
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

      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');

      // Check specific limits
      if (isImage) {
        const currentImages = updatedFiles.filter(f => f.type.startsWith('image/')).length;
        if (maxImages && currentImages >= maxImages) {
          setMediaError(`Maximum ${maxImages} images allowed.`);
          continue;
        }
      }

      if (isVideo) {
        const currentVideos = updatedFiles.filter(f => f.type.startsWith('video/')).length;
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

  const clearFiles = (fieldName: string) => {
    const previews = filePreviews[fieldName] || [];
    previews.forEach(p => URL.revokeObjectURL(p.url));
    
    setFilePreviews(prev => ({ ...prev, [fieldName]: [] }));
    setMediaError(null);
    handleWizardInput(fieldName, []);
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
    if (!hasVariants) return null;

    return (
      <div className="space-y-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Customize your Item</h3>
        {product.variantsConfig.options.map((option, idx) => (
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

        {step.fields.map((field, idx) => (
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
                    {filePreviews[field.name]?.map((preview, pIdx) => (
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
                        {preview.type.startsWith('video/') && (
                          <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full pointer-events-none">
                            Video
                          </div>
                        )}
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
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="p-6 md:p-8">
        {/* Phase 1: Variants */}
        {(!hasWizard || currentStep === 0) && renderVariants()}

        {/* Phase 2: Wizard Steps */}
        {hasWizard && (
          <>
            {renderWizardStep()}
            
            <div className="flex justify-between items-center mt-8 pt-4 border-t">
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={currentStep === 0}
                className={cn("rounded-full", currentStep === 0 ? "invisible" : "visible")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>
              
              <div className="text-center">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold" style={{ color: primaryColor }}>
                  ₦{calculateTotalPrice().toLocaleString()}
                </div>
              </div>
              
              <Button 
                onClick={nextStep} 
                className="rounded-full px-6 bg-rose-600 hover:bg-rose-700 text-white font-bold"
              >
                {currentStep === steps.length - 1 ? 'Add to Bundle' : 'Next Step'}
                {currentStep !== steps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </>
        )}

        {!hasWizard && (
          <div className="mt-6 flex items-center justify-between pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-2xl font-bold" style={{ color: primaryColor }}>
                ₦{calculateTotalPrice().toLocaleString()}
              </div>
            </div>
            <Button 
              onClick={handleComplete} 
              className="rounded-full px-8 h-12 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              Add to Bundle <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
