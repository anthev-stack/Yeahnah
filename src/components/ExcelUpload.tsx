'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, X, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExcelUploadProps {
  onGuestsImported: (guests: { firstName: string; lastName: string; guestId: string }[]) => void;
  currentGroup?: string;
  isMultiGroup?: boolean;
}

export default function ExcelUpload({ onGuestsImported, currentGroup, isMultiGroup }: ExcelUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );
    
    if (excelFile) {
      handleFileUpload(excelFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      // Skip header row and process data
      const guests = jsonData.slice(1).map((row: any) => {
        const [firstName, lastName, guestId] = row;
        return {
          firstName: firstName?.toString().trim() || '',
          lastName: lastName?.toString().trim() || '',
          guestId: guestId?.toString().trim() || ''
        };
      }).filter(guest => guest.firstName); // Only include guests with first names

      onGuestsImported(guests);
      
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert('Error processing Excel file. Please make sure it\'s a valid Excel file with columns: First Name, Last Name, Guest ID');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="excel-upload-section">
      <div className="excel-upload-header">
        <h4 className="excel-upload-title">
          <FileSpreadsheet size={20} />
          Upload Excel Spreadsheet
        </h4>
        <p className="excel-upload-description">
          Upload an Excel file (.xlsx) with columns: <strong>First Name, Last Name, Guest ID</strong>
        </p>
      </div>
      
      <div
        className={`excel-upload-area ${isDragging ? 'dragging' : ''} ${uploading ? 'uploading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <div className="excel-upload-content">
          {uploading ? (
            <>
              <div className="spinner"></div>
              <p>Processing Excel file...</p>
            </>
          ) : (
            <>
              <Upload size={32} className="upload-icon" />
              <p className="upload-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="upload-subtitle">
                Excel files (.xlsx, .xls)
              </p>
              {currentGroup && (
                <p className="upload-note">
                  For: <strong>{currentGroup}</strong>
                </p>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="excel-upload-help">
        <h5>Excel Format:</h5>
        <div className="excel-format-example">
          <table>
            <thead>
              <tr>
                <th>A (First Name)</th>
                <th>B (Last Name)</th>
                <th>C (Guest ID)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>John</td>
                <td>Smith</td>
                <td>JS001</td>
              </tr>
              <tr>
                <td>Jane</td>
                <td>Doe</td>
                <td>JD002</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="help-note">
          <strong>Note:</strong> Guest ID is optional. Leave empty if not needed.
        </p>
      </div>
    </div>
  );
}
