import { describe, expect, it } from 'vitest';
import { pareceTV } from './tv.js';

describe('pareceTV', () => {
  it('reconhece a LG do teste real', () => {
    expect(pareceTV('Mozilla/5.0 (Linux; NetCast; U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.3945.79')).toBe(true);
    expect(pareceTV('Mozilla/5.0 (Web0S; Linux/SmartTV) AppleWebKit/537.36')).toBe(true);
    expect(pareceTV('Mozilla/5.0 (SMART-TV; LINUX; Tizen 6.0)')).toBe(true);
  });

  it('não confunde com computador e celular', () => {
    expect(pareceTV('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/156.0.0.0')).toBe(false);
    expect(pareceTV('Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/156.0.0.0 Mobile')).toBe(false);
    expect(pareceTV(undefined)).toBe(false);
  });
});
