import { ChangeEvent } from "react";

interface FileUploadZoneProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  acceptedTypes?: string[];
  className?: string;
}

const FileUploadZone = ({ 
  selectedFile, 
  onFileSelect, 
  acceptedTypes = ["JPG", "PNG", "PDF"],
  className = ""
}: FileUploadZoneProps) => {
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const acceptString = acceptedTypes.map(type => {
    switch (type.toUpperCase()) {
      case "JPG":
      case "JPEG":
        return ".jpg,.jpeg";
      case "PNG":
        return ".png";
      case "PDF":
        return ".pdf";
      default:
        return `.${type.toLowerCase()}`;
    }
  }).join(",");

  return (
    <div className={`flex items-center justify-center w-full mt-6 ${className}`}>
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-32 border border-[#CDCFD3] rounded-lg cursor-pointer bg-white hover:bg-gray-100">
        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <p className="mb-1">Ricevuta ({acceptedTypes.join(", ")})</p>
            <p className="text-primary underline font-normal">Carica file</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <p className="mb-1 text-secondary">File caricato:</p>
            <p className="mb-1 text-secondary font-semibold text-sm">{selectedFile.name}</p>
            <p className="text-primary underline font-normal">Aggiorna file</p>
          </div>
        )}
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          accept={acceptString}
          onChange={handleFileChange}
        />
      </label>
    </div>
  );
};

export default FileUploadZone;