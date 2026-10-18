import type {SVGProps} from 'react';
export function Icon({name,...props}:SVGProps<SVGSVGElement>&{name:'down'|'pin'|'whatsapp'|'instagram'}){
const paths={
down:<path d="M12 4v16M5 13l7 7 7-7"/>,
pin:<><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
instagram:<><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none"/></>,
whatsapp:<><path d="M21 11.5a9 9 0 0 1-13.4 7.9L3 21l1.6-4.6A9 9 0 1 1 21 11.5Z"/><path d="M8.1 7.2c-.4 0-1.2.7-1.2 1.7 0 2.7 4.3 6.9 7.1 6.9 1 0 1.8-.8 1.8-1.2v-1.1l-2.7-1.2-.9 1c-1.3-.6-2.4-1.7-3-3l1-.9L9.1 7.2Z"/></>};
return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;}
