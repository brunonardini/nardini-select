'use client';
import {useLayoutEffect,useRef,useState} from 'react';

export default function HeroDog(){
 const image=useRef<HTMLImageElement>(null);
 const [position,setPosition]=useState<{top:number;left:number;width:number}|undefined>();
 useLayoutEffect(()=>{
  const img=image.current;
  const line=document.querySelector<HTMLElement>('.hero-second-line');
  const container=img?.parentElement;
  if(!img||!line||!container)return;
  const align=()=>{
   if(window.innerWidth<=1100){setPosition(undefined);return;}
   const text=line.getBoundingClientRect();
   const frame=container.getBoundingClientRect();
   // The nose sits at 24% of the source width and 31% of its height.
   const noseY=text.top-frame.top+text.height/2;
   // Extend the cropped chest past the hero edge so the raised dog never floats.
   const height=(frame.height-noseY+2)/.69;
   const width=height*1507/1044;
   setPosition({top:noseY-height*.31,left:text.right-frame.left+32-width*.24,width});
  };
  const observer=new ResizeObserver(align);
  observer.observe(container);observer.observe(line);observer.observe(img);
  window.addEventListener('resize',align);
  document.fonts.ready.then(align);
  img.addEventListener('load',align);align();
  return()=>{observer.disconnect();window.removeEventListener('resize',align);img.removeEventListener('load',align);};
 },[]);
 return <img ref={image} className="hero-dog" src="/images/hero-weimaraner-transparente.png" width="1507" height="1044" alt="Weimaraner cinza prateado, o cão que inspira a identidade da Nardini Select" fetchPriority="high" style={position?{top:position.top,left:position.left,width:position.width,right:'auto',bottom:'auto'}:undefined}/>;
}
