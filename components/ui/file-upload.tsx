'use client';

import { useState, useRef, forwardRef, ForwardedRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Upload, File, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onChange: (files: File[]) => void;
  value: File[];
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number; // in MB
  accept?: string;
  className?: string;
}

export const FileUpload = forwardRef((
  {
    onChange,
    value = [],
    multiple = false,
    maxFiles = 5,
    maxSize = 10, // Default 10MB
    accept = 'application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx',
    className,
  }: FileUploadProps,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList: FileList): File[] => {
    const validFiles: File[] = [];
    setError(null);

    // Check if adding these files would exceed the max files limit
    if (value.length + fileList.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return validFiles;
    }

    // Validate each file
    Array.from(fileList).forEach(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File "${file.name}" exceeds the maximum size of ${maxSize}MB`);
        return;
      }

      // Add to valid files
      validFiles.push(file);
    });

    return validFiles;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      const validFiles = validateFiles(e.target.files);
      if (validFiles.length > 0) {
        onChange([...value, ...validFiles]);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles = validateFiles(e.dataTransfer.files);
      if (validFiles.length > 0) {
        onChange([...value, ...validFiles]);
      }
    }
  };

  const handleRemove = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension || '')) {
      return <File className="h-5 w-5 text-blue-500" />;
    } else if (['pdf'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-red-500" />;
    } else if (['doc', 'docx'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-blue-600" />;
    } else if (['xls', 'xlsx'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-green-600" />;
    } else if (['ppt', 'pptx'].includes(extension || '')) {
      return <FileText className="h-5 w-5 text-orange-500" />;
    } else {
      return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div ref={ref} className={className}>
      <div
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-input",
          value.length > 0 && "pb-2"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          onChange={handleChange}
          accept={accept}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center justify-center text-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm font-medium mb-1">
            Drag & drop files here, or click to select files
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Supports {accept.split(',').join(', ')}
          </p>
          <p className="text-xs text-muted-foreground">
            Max {maxFiles} files, up to {maxSize}MB each
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}

      {value.length > 0 && (
        <ul className="mt-4 space-y-2">
          {value.map((file, index) => (
            <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
              <div className="flex items-center space-x-2 overflow-hidden">
                {getFileIcon(file.name)}
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleRemove(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

FileUpload.displayName = 'FileUpload';
