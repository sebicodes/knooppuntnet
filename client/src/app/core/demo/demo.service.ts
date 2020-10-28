import {Injectable} from "@angular/core";

@Injectable()
export class DemoService {

  private videoElement: HTMLVideoElement;
  private sourceElement: HTMLSourceElement;

  setVideoElement(videoElement: HTMLVideoElement, sourceElement: HTMLSourceElement): void {
    this.videoElement = videoElement;
    this.sourceElement = sourceElement;
  }

  setSource(videoSource: string): void {
    this.sourceElement.src = videoSource;
    this.videoElement.load();
  }

  setProgress(progress: number): void {

    console.log("setProgress " + progress);

    this.videoElement.currentTime = progress * this.videoElement.duration;
  }

  end(): void {
    if (this.videoElement && this.sourceElement) {
      this.videoElement.pause();
      this.sourceElement.src = "";
      this.videoElement.load();
      this.sourceElement = null;
      this.videoElement = null;
    }
  }

  play(): void {
    if (this.videoElement) {
      const promise = this.videoElement.play();
      if (promise !== undefined) {
        promise.then(_ => {
          // Autoplay started
        }).catch(error => {
          // Autoplay was prevented
        });
      }
    }
  }

  pause(): void {
    if (this.videoElement) {
      this.videoElement.pause();
    }
  }

  isPlaying(): boolean {
    return this.videoElement && !this.videoElement.paused;
  }

  get duration(): number {
    if (this.videoElement) {
      return this.videoElement.duration;
    }
    return 0;
  }

  get time(): number {
    if (this.videoElement) {
      return this.videoElement.currentTime;
    }
    return 0;
  }

}
