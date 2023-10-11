const uuid = require('uuid');
const forge = require('node-forge');

// Generate the issuer's RSA key pair
// or we can store onetime issue key pair in db, and we have to fetch everytime whenever request happening
let issuerKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });

// Task 1: Student Registration
class StudentRegistration {
  constructor() {
    this.students = {}; // Object to store student records
  }

  registerStudent(name, email) {
    const studentId = uuid.v4(); // Generate a unique ID
    this.students[studentId] = {
      name,
      email,
      studentId
    };
    return studentId;
  }
}

// Task 2: Certificate Issuance
class CertificateIssuer {
  constructor() {
    this.certificates = {}; // Object to store issued certificates

    // issuerKeyPair = forge.pki.rsa.generateKeyPair({ bits: 2048 });
  }

  issueCertificate(studentId, courseName, completionDate) {
    const student = studentRegistration.students[studentId];
    if (student) {
      const certificate = {
        studentName: student.name,
        courseName,
        completionDate,
        issuer: 'TechEd Academy',
        studentId: studentId
      };

      // Sign the certificate with the issuer's private key
      const certificateJson = JSON.stringify(certificate, null, 2);
      const md = forge.md.sha256.create();
      md.update(certificateJson);
      const signature = issuerKeyPair.privateKey.sign(md);
      certificate.issuerSignature = forge.util.bytesToHex(signature);

      // Store the certificate
      const certificateId = uuid.v4();
      this.certificates[certificateId] = certificate;
      console.log({student})
      return certificate;
    } else {
      return null;
    }
  }
}

// Task 4: Verification Function
class CertificateVerifier {
  verifyCertificate(certificate) {
    if (certificate.issuerSignature) {
      const { issuerSignature, ...certificateWithoutSignature } = certificate;
      const certificateJson = JSON.stringify(certificateWithoutSignature, null, 2);

      // Verify the certificate with the issuer's public key
      const md = forge.md.sha256.create();
      md.update(certificateJson);
      const signature = forge.util.hexToBytes(issuerSignature);

      try {
        // console.log(issuerKeyPair)
        return issuerKeyPair.publicKey.verify(md.digest().getBytes(), signature);
      } catch (err) {
        // console.log({err})
        return false;
      }
    }
    return false;
  }
}

// Task 5: Documentation
// Comments have been added throughout the code to explain its functionality

// Example Usage:
const studentRegistration = new StudentRegistration();
const certificateIssuer = new CertificateIssuer();
const certificateVerifier = new CertificateVerifier();

// Register a student
const studentId = studentRegistration.registerStudent('John Doe', 'john@example.com');

// Issue a certificate
const certificate = certificateIssuer.issueCertificate(studentId, 'Python Programming', '2023-10-01');

// Verify the certificate
const certificateIsAuthentic = certificateVerifier.verifyCertificate(certificate);

// Output
console.log('Student ID:', studentId);
console.log('Certificate:');
console.log(JSON.stringify(certificate, null, 2));
console.log('Certificate is authentic:', certificateIsAuthentic);
