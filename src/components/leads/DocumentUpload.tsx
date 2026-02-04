import { useRef } from "react";
import { Camera, Upload, X, FileText, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface DocumentUploadProps {
  label: string;
  description: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: string;
  required?: boolean;
}

export function DocumentUpload({
  label,
  description,
  files,
  onFilesChange,
  accept = "image/*,.pdf",
  required = false,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    onFilesChange([...files, ...newFiles]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const openCamera = () => {
    cameraInputRef.current?.click();
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-3 w-3" />;
    }
    return <FileText className="h-3 w-3" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      <p className="text-xs text-muted-foreground">{description}</p>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 py-1 px-2 max-w-full"
            >
              {getFileIcon(file)}
              <span className="truncate max-w-[100px] text-xs">{file.name}</span>
              <span className="text-muted-foreground text-xs">
                ({formatFileSize(file.size)})
              </span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="ml-1 hover:text-destructive transition-colors"
                aria-label="Remover arquivo"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {/* Camera button - prioritized on mobile */}
        {isMobile && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openCamera}
            className="flex items-center gap-2"
          >
            <Camera className="h-4 w-4" />
            Tirar Foto
          </Button>
        )}
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileSelector}
          className="flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          {isMobile ? "Galeria" : "Selecionar Arquivo"}
        </Button>
      </div>

      {/* Hidden file input for gallery/files */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleAddFiles}
        className="sr-only"
      />

      {/* Hidden camera input for mobile */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleAddFiles}
        className="sr-only"
      />
    </div>
  );
}
