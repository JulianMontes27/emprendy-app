import { error } from "console";

export function validateContacts(contacts: any[]) {
  const errors: any = [];

  // console.log(contacts);
  // [
  //   {
  //     firstName: "John",
  //     lastName: "Doe",
  //     email: "john.doe@example.com",
  //     companyName: "Acme Corp",
  //     jobTitle: "Software Engineer",
  //     phone: "+1234567890",
  //     linkedinUrl: "https://linkedin.com/in/johndoe",
  //     website: "https://linkedin.com/in/johndoe",
  //     industry: "Technology",
  //     companySize: "201-500",
  //     location: "New York, USA",
  //     notes: "Met at a tech conference.",
  //     tags: '["prospect", "follow-up"]',
  //   },
  //   {
  //     firstName: "Jane",
  //     lastName: "Smith",
  //     email: "jane.smith@example.com",
  //     companyName: "Beta LLC",
  //     jobTitle: "Marketing Manager",
  //     phone: "+1987654321",
  //     linkedinUrl: "https://linkedin.com/in/janesmith",
  //     website: "https://linkedin.com/in/janesmith",
  //     industry: "Marketing",
  //     companySize: "51-200",
  //     location: "San Francisco, USA",
  //     notes: "Interested in email campaigns.",
  //     tags: '["lead", "high-priority"]',
  //   },
  // ];

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
    // if (contact.tags && !Array.isArray(contact.tags)) {
    //   errors.push(`Row ${index + 2}: Tags must be an array`);
    // }

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
