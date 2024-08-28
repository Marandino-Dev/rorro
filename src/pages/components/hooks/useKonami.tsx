import { useEffect } from 'react';

import anime from 'animejs';

const u = 'ArrowUp';
const d = 'ArrowDown';
const l = 'ArrowLeft';
const r = 'ArrowRight';
const b = 'KeyB';
const a = 'KeyA';

export default function useKonamiCode(): void {

  const userInput: string[] = [];

  const konamiCodeArray = [u, u, d, d, l, r, l, r, b, a];

  // TODO: remove that any, somehow the Event type doesn't contain the same stuff as the KeyboardEvent but the KeyboardEvent
  // is not available to be passed on the addeventlistener...
  // eslint-disable-next-line
  function handleKeyPress(this: HTMLElement, e: any) {

    // only keep the last ten inputs
    userInput.push(e.code);
    if (userInput.length > konamiCodeArray.length) {
      userInput.shift();
    }

    // this ain't spaghetti, this is the whole italian restaurant
    if (userInput.toString() == konamiCodeArray.toString()) {

      const successAudio = new Audio('/success_sound.ogg');
      successAudio.volume = 0.35;
      successAudio.play();

      const logo = document.querySelector('#rorroLogo') as HTMLImageElement;
      const logoText = document.querySelector('#rorroText');
      const hero = document.querySelector('#rorroHero');

      if (logo && logoText && hero) {
        logo.src = '/images/monito.png';
        logoText.textContent = 'MONITO';
        hero.textContent = 'MONITO: ';

        anime.timeline({ loop: true })
          .add({
            targets: '#rorroLogo',
            translateY: ['-.3rem'],
            translateX: ['1rem'],
            duration: 500,
            delay: 40,
          });
      }
    }
  }

  useEffect(() => {
    // on run
    document.addEventListener('keydown', handleKeyPress);

    // when unmounted
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);
}
