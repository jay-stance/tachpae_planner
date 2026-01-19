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
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const steps = product.customizationSchema?.steps || [];
  const hasVariants = product.variantsConfig?.options?.length > 0;
  const hasWizard = steps.length > 0;

  // Video constraints from product config or defaults
  const maxDuration = (product as any).videoConfig?.maxDuration || 10; // seconds
  const maxSize = (product as any).videoConfig?.maxSize || 50; // MB

  const handleVariantSelect = (optionName: string, value: any) => {
    setSelectedVariants(prev => ({ ...prev, [optionName]: value }));
  };

  const handleWizardInput = (fieldName: string, value: any) => {
    setCustomizationData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFileUpload = async (fieldName: string, file: File) => {
    setVideoError(null);
    
    // Size validation
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setVideoError(`File too large! Maximum ${maxSize}MB allowed.`);
      return;
    }

    // For videos, check duration
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > maxDuration) {
          setVideoError(`Video too long! Maximum ${maxDuration} seconds allowed.`);
          return;
        }
        // Valid video
        const previewUrl = URL.createObjectURL(file);
        setVideoPreview(previewUrl);
        handleWizardInput(fieldName, { file, previewUrl });
      };
      
      video.src = URL.createObjectURL(file);
    } else {
      // Non-video file
      const previewUrl = URL.createObjectURL(file);
      handleWizardInput(fieldName, { file, previewUrl });
    }
  };

  const clearFile = (fieldName: string) => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setVideoError(null);
    handleWizardInput(fieldName, null);
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
                  Max {maxDuration}s duration, {maxSize}MB size
                </div>
                
                <div className="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50/50">
                  {customizationData[field.name] || videoPreview ? (
                    <div className="p-4">
                      {/* Video Preview */}
                      {videoPreview && (
                        <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-3">
                          <video 
                            ref={videoRef}
                            src={videoPreview}
                            className="w-full h-full object-contain"
                            controls
                            playsInline
                          />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-green-600">
                          <Check className="w-5 h-5" />
                          <span className="text-sm font-medium">File Ready</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => clearFile(field.name)} 
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor={`file-${field.name}`} className="block p-8 cursor-pointer hover:bg-gray-100/50 transition-colors">
                      <Upload className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                      <p className="text-sm text-gray-500 text-center mb-4">
                        Click to upload or drag and drop
                      </p>
                      <div className="flex justify-center">
                        <div 
                          className="inline-flex h-10 items-center justify-center rounded-full px-6 text-sm font-medium text-white shadow cursor-pointer"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Play className="w-4 h-4 mr-2" /> Select File
                        </div>
                      </div>
                      <input 
                        type="file" 
                        accept={field.accept}
                        className="hidden" 
                        id={`file-${field.name}`}
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload(field.name, e.target.files[0]);
                        }}
                      />
                    </label>
                  )}
                </div>

                {/* Error Message */}
                {videoError && (
                  <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4" />
                    {videoError}
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
                className="rounded-full px-6"
                style={{ backgroundColor: primaryColor }}
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
              className="rounded-full px-8 h-12"
              style={{ backgroundColor: primaryColor }}
            >
              Add to Bundle <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
