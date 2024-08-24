import { useEffect } from 'react';

const u = 'ArrowUp';
const d = 'ArrowDown';
const l = 'ArrowLeft';
const r = 'ArrowRight';
const b = 'KeyB';
const a = 'KeyA';

export function useKonamiCode(): void {

  const userInput: string[] = [];

  const konamiCodeArray = [u, u, d, d, l, r, l, r, b, a];

  // TODO: remove that any, somehow the Event type doesn't contain the same stuff as the KeyboardEvent but the KeyboardEvent
  // is not available to be passed on the addeventlistener...
  //eslint-disable-next-line
  function handleKeyPress(this: HTMLElement, e: any) {

    userInput.push(e.code);
    if (userInput.length > konamiCodeArray.length) {
      userInput.shift();

    }



    if (userInput.toString() == konamiCodeArray.toString()) {

      new Audio('/success_sound.ogg').play();

      const logo = document.querySelector('#rorroLogo') as HTMLImageElement;
      const logoText = document.querySelector('#rorroText');

      if (logo && logoText) {
        logo.src = 'https://cdn-icons-png.flaticon.com/256/3819/3819238.png'; // Change this to the path of your new image
        logoText.textContent = 'MONITO';
      }
      console.log(' You\'ve entered the MONITO code');
    }
  }

  useEffect(() => {
    //on run
    document.addEventListener('keydown', handleKeyPress);

    // when unmounted
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
}
