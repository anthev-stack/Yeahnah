'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface LogoUploadProps {
  onLogoUploaded: (logoUrl: string) => void;
  currentLogo?: string;
}

export default function LogoUpload({ onLogoUploaded, currentLogo }: LogoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        onLogoUploaded(result.logoUrl);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to upload logo');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      alert('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    onLogoUploaded('');
  };

  return (
    <div className="form-group">
      <label className="form-label">Event Logo (Optional)</label>
      
      {currentLogo ? (
        <div className="logo-preview">
          <img 
            src={currentLogo} 
            alt="Event logo" 
            className="logo-image"
          />
          <button
            type="button"
            onClick={removeLogo}
            className="remove-logo-btn"
            title="Remove logo"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          className={`logo-upload-area ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          
          <div className="upload-content">
            {uploading ? (
              <>
                <div className="spinner"></div>
                <p>Uploading...</p>
              </>
            ) : (
              <>
                <Upload size={32} className="upload-icon" />
                <p className="upload-text">
                  <strong>Click to upload</strong> or drag and drop
                </p>
                <p className="upload-subtitle">
                  PNG, JPG, GIF up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
      <p className="form-help">
        Add your company logo or event branding to personalize the invitation
      </p>
    </div>
  );
}
