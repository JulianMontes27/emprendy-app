// Helper function to validate contact data
export function validateContacts(contacts) {
  const errors = [];

  contacts.forEach((contact, index) => {
    // Check for required email
    if (!contact.email) {
      errors.push(`Row ${index + 2}: Missing required email address`);
    } else if (!isValidEmail(contact.email)) {
      errors.push(`Row ${index + 2}: Invalid email format "${contact.email}"`);
    }

    // Check for other required fields if needed
    // Add additional validations as needed
  });

  return errors;
}

// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to normalize Excel headers
// This helps handle different variations of column names
export function normalizeHeaders(worksheet) {
  const headerMap = {
    "first name": "firstName",
    firstname: "firstName",
    "last name": "lastName",
    lastname: "lastName",
    "email address": "email",
    "company name": "companyName",
    company: "companyName",
    "job title": "jobTitle",
    title: "jobTitle",
    position: "jobTitle",
    "phone number": "phone",
    linkedin: "linkedinUrl",
    "linkedin url": "linkedinUrl",
    // Add more mappings as needed
  };

  // Get the headers row
  const range = XLSX.utils.decode_range(worksheet["!ref"]);
  const headers = [];

  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
    if (cell && cell.t) {
      let header = cell.v.toString().toLowerCase().trim();
      headers[C] = headerMap[header] || header;
    }
  }

  // Create new worksheet with normalized headers
  const newWs = XLSX.utils.aoa_to_sheet([headers]);

  // Copy data
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (worksheet[cellRef]) {
        newWs[XLSX.utils.encode_cell({ r: R - range.s.r, c: C })] =
          worksheet[cellRef];
      }
    }
  }

  return newWs;
}
