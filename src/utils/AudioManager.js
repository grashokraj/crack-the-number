/*
  Audio Utility - Manages sound effects for the game
  Types: 'click', 'error', 'success'
*/

export class AudioManager {
  constructor() {
    this.sounds = {
      click: new Audio(process.env.PUBLIC_URL + '/sounds/click.mp3'),
      error: new Audio(process.env.PUBLIC_URL + '/sounds/error.mp3'),
      success: new Audio(process.env.PUBLIC_URL + '/sounds/success.mp3'),
    };

    // Set volume for all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.5;
    });
  }

  play(type) {
    if (this.sounds[type]) {
      // Reset and play
      this.sounds[type].currentTime = 0;
      this.sounds[type].play().catch(() => {
        // Silently fail if audio can't play (e.g., browser restrictions)
      });
    }
  }

  setVolume(type, volume) {
    if (this.sounds[type]) {
      this.sounds[type].volume = Math.max(0, Math.min(1, volume));
    }
  }

  setAllVolume(volume) {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = Math.max(0, Math.min(1, volume));
    });
  }
}

// Create singleton instance
export const audioManager = new AudioManager();
