export const formatters = {
  currency: (value: number, currency: string = '₽'): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency === '₽' ? 'RUB' : currency,
    }).format(value).replace('₽', currency);
  },

  date: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(d);
  },

  time: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(d);
  },

  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      return `+${match[1]} (${match[2]}) ${match[3]}-${match[4]}-${match[5]}`;
    }
    return phone;
  },

  truncate: (text: string, length: number): string => {
    return text.length > length ? `${text.substring(0, length)}...` : text;
  },
};