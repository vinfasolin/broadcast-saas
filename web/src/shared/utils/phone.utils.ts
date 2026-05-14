export const onlyDigits = (value: string) => {
  return value.replace(/\D/g, "");
};

export const getBrazilPhoneWithoutCountryCode = (value: string) => {
  const digits = onlyDigits(value);

  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    return digits.slice(2);
  }

  return digits;
};

export const isValidBrazilPhone = (value: string) => {
  const phone = getBrazilPhoneWithoutCountryCode(value);

  return phone.length === 10 || phone.length === 11;
};

export const normalizeBrazilPhoneToE164 = (value: string) => {
  const phone = getBrazilPhoneWithoutCountryCode(value);

  if (!isValidBrazilPhone(phone)) {
    return "";
  }

  return `+55${phone}`;
};