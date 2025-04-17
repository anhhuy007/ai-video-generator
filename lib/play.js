/**
 * Audio player utility for browser environments
 * Properly handles ArrayBuffer or Blob from ElevenLabs API
 */

const play = async audioData => {
  return new Promise((resolve, reject) => {
    try {
      // Create an audio element
      const audio = new Audio()

      // Handle audio data based on its type
      let url

      if (audioData instanceof ArrayBuffer) {
        // Convert ArrayBuffer to Blob
        const blob = new Blob([audioData], { type: 'audio/mp3' })
        url = URL.createObjectURL(blob)
      } else if (audioData instanceof Blob) {
        // Already a Blob
        url = URL.createObjectURL(audioData)
      } else if (typeof audioData === 'string') {
        // Assume it's already a URL
        url = audioData
      } else {
        throw new Error('Unsupported audio data format')
      }

      // Set up event handlers before setting src
      audio.onended = () => {
        URL.revokeObjectURL(url) // Clean up the blob URL
        resolve()
      }

      audio.onerror = event => {
        URL.revokeObjectURL(url)
        console.error('Audio playback error:', event)
        reject(new Error('Audio playback failed'))
      }

      // Set the source and load
      audio.src = url
      audio.load()

      // Start playback
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.error('Play promise error:', err)
          URL.revokeObjectURL(url)
          reject(err)
        })
      }
    } catch (error) {
      console.error('Play function error:', error)
      reject(error)
    }
  })
}

export default play
