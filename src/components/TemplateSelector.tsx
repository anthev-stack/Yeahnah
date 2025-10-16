'use client';

import React from 'react';
import { Palette, Moon, Heart, Sun } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (template: string) => void;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    background: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}

const templates: TemplateOption[] = [
  {
    id: 'light',
    name: 'Light Theme',
    description: 'Clean and professional with light backgrounds',
    icon: <Sun size={24} />,
    preview: {
      background: '#ffffff',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      accentColor: '#00ff88'
    }
  },
  {
    id: 'dark',
    name: 'Dark Theme',
    description: 'Modern and sleek with dark backgrounds',
    icon: <Moon size={24} />,
    preview: {
      background: '#1a1a1a',
      primaryColor: '#00ff88',
      secondaryColor: '#ffffff',
      accentColor: '#667eea'
    }
  },
  {
    id: 'love',
    name: 'Love Theme',
    description: 'Warm and romantic with pink accents',
    icon: <Heart size={24} />,
    preview: {
      background: '#fdf2f8',
      primaryColor: '#ec4899',
      secondaryColor: '#be185d',
      accentColor: '#fbbf24'
    }
  }
];

export default function TemplateSelector({ selectedTemplate, onTemplateSelect }: TemplateSelectorProps) {
  return (
    <div className="form-group">
      <label className="form-label">Invitation Template</label>
      <p className="form-help">
        Choose a theme for your invitation page
      </p>
      
      <div className="template-grid">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`template-option ${selectedTemplate === template.id ? 'selected' : ''}`}
            onClick={() => onTemplateSelect(template.id)}
          >
            <div className="template-preview">
              <div 
                className="template-background"
                style={{ backgroundColor: template.preview.background }}
              >
                <div className="template-colors">
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: template.preview.primaryColor }}
                  ></div>
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: template.preview.secondaryColor }}
                  ></div>
                  <div 
                    className="color-swatch"
                    style={{ backgroundColor: template.preview.accentColor }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="template-info">
              <div className="template-icon">
                {template.icon}
              </div>
              <div className="template-details">
                <h4 className="template-name">{template.name}</h4>
                <p className="template-description">{template.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
