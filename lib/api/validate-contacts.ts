export function validateContacts(contacts: any[]) {
  const errors: any = [];

  contacts.forEach((contact, index) => {
    // Minimum validation - email is the only truly required field
    if (
      !contact.email ||
      typeof contact.email !== "string" ||
      contact.email.trim() === ""
    ) {
      // append the row (contact) to the errors array
      errors.push(`Row ${index + 2}: Missing or invalid email address`);
    } else {
      // Additional email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contact.email.trim())) {
        errors.push(
          `Row ${index + 2}: Invalid email format "${contact.email}"`
        );
      }
    }

    // Optional: Add more specific validations
    if (contact.tags && !Array.isArray(contact.tags)) {
      errors.push(`Row ${index + 2}: Tags must be an array`);
    }

    // Optional: Length checks for specific fields
    const maxLengths = {
      firstName: 100,
      lastName: 100,
      companyName: 200,
      jobTitle: 150,
      email: 255,
    };
    // first convert the maxLengths Object to an Array, then iterate over the indexes in the array
    Object.entries(maxLengths).forEach(([field, maxLength]) => {
      if (contact[field] && contact[field].length > maxLength) {
        errors.push(
          `Row ${
            index + 2
          }: ${field} exceeds maximum length of ${maxLength} characters`
        );
      }
    });
  });

  return errors;
}

// Example usage of flexible mapping
function flexibleContactMapping(row: any) {
  // Create a more forgiving mapping with fallback strategies
  const mappings = [
    {
      schemaField: "firstName",
      possibleFields: ["firstName", "first_name", "First Name", "first name"],
    },
    {
      schemaField: "lastName",
      possibleFields: ["lastName", "last_name", "Last Name", "last name"],
    },
    {
      schemaField: "email",
      possibleFields: ["email", "Email", "email address", "Email Address"],
    },
    // Add more mappings as needed
  ];

  const contact = {
    source: "excel_import",
    status: "active",
    tags: [],
  };

  mappings.forEach((mapping) => {
    for (const possibleField of mapping.possibleFields) {
      if (row[possibleField]) {
        contact[mapping.schemaField] = row[possibleField];
        break;
      }
    }
  });

  return contact;
}
