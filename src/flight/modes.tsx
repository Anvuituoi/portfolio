import { createContext, useContext } from 'react';
import type { Modes } from './store';

export const ModesContext = createContext<Modes>({ motion: false, webgl: false, compact: true, live: false, lite: true });
export const useModes = () => useContext(ModesContext);

/** Base-aware URL for files in /public. */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;
