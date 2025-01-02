export function getCookie(name: string) {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith(`${name}=`));
    if (cookieValue) {
      return cookieValue.split('=')[1];
    }
    return '';
};

export function setCookie(name: string, value: string, days: number = 0, sameSite: 'Lax' | 'Strict' | 'None' = 'Lax', secure: boolean = false) {
  
  const expires = days ? `expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}` : '';
  const secureFlag = secure ? 'Secure' : '';
  const sameSiteFlag = `SameSite=${sameSite}`;

  document.cookie = `${name}=${value}; ${expires}; path=/; ${sameSiteFlag}; ${secureFlag}`.trim();
}

