const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Storage for profile pictures
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'jobs-portal/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

// Storage for documents (resume, cover letter)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: 'jobs-portal/documents',
      allowed_formats: ['pdf', 'doc', 'docx'],
      resource_type: 'raw',
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    };
  },
});

// File filter for profile pictures
const profileFileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only jpg, jpeg, png, webp images are allowed for profile pictures.'), false);
  }
};

// File filter for documents
const documentFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
    'application/x-pdf',
    'binary/octet-stream',
  ];
  const allowedExts = ['.pdf', '.doc', '.docx'];
  const path = require('path');
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only pdf, doc, docx files are allowed for documents.'), false);
  }
};

// Multer instance for profile pictures
const uploadProfileMulter = multer({
  storage: profileStorage,
  fileFilter: profileFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// Multer instance for documents
const uploadDocumentMulter = multer({
  storage: documentStorage,
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// Export configured middleware
const uploadProfile = uploadProfileMulter.single('profilePicture');
const uploadDocument = uploadDocumentMulter.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 },
]);
const uploadResumeSingle = uploadDocumentMulter.single('resume');

module.exports = { uploadProfile, uploadDocument, uploadResumeSingle };
