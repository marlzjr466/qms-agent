export default () => {
  const synth = window.speechSynthesis
  const voices = synth.getVoices()
  const voiceTypes = {
    m: 1,
    f: 2
  }

  function speak (text, voiceType = 'f') {
    const utterMessage = new SpeechSynthesisUtterance(text)
    utterMessage.voice = voices[voiceTypes[voiceType]]
    utterMessage.lang = 'en-US'

    // trigger speak
    synth.speak(utterMessage)
  }

  return {
    speak
  }
}