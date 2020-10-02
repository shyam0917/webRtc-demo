import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { Guid } from "guid-typescript";
import Peer from 'peerjs';
import RecordRTC from 'recordrtc';
import { ChatServiceService } from '../chat-service.service';

@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styleUrls: ['./video.component.css']
})
export class VideoComponent implements OnInit, AfterViewInit {
  @ViewChild('myvideo', { static: false }) myVideo: any;
  peer: any;
  mypeerid: any = "";
  otherpeerid: any = "";
  connection: any;
  user: String;
  room: '131921';
  messageText: String;
  messageArray: Array<{ user: String, message: String }> = [];
  constructor(private elRef: ElementRef, private _chatService: ChatServiceService) {
    this._chatService.newUserJoined()
      .subscribe(data => this.messageArray.push(data));


    this._chatService.userLeftRoom()
      .subscribe(data => this.messageArray.push(data));

    this._chatService.newMessageReceived()
      .subscribe(data => this.messageArray.push(data));
  }

  ngOnInit(): void {
    this.room = '131921';
    this.join();
  }

  ngAfterViewInit() {
    let video = this.myVideo.nativeElement;
    let uuid = Guid.create();
    this.peer = new Peer();
    setTimeout(() => {
      this.mypeerid = this.peer.id;
    }, 3000);

    this.peer.on('connection', function (conn) {
      conn.on('data', function (data) {
        console.log(data);
      });
    });
    var n = <any>navigator;

    n.getUserMedia = (n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia);

    this.peer.on('call', function (call) {

      n.getUserMedia({ video: true, audio: true }, function (stream) {
        call.answer(stream);
        call.on('stream', function (remotestream) {
          const mediaStream = new MediaStream(remotestream);
          video.srcObject = mediaStream;
          // video.srcObject = URL.createObjectURL(remotestream);
          video.play();
          // video.src = URL.createObjectURL(remotestream);
        })
      }, function (err) {
        console.log('Failed to get stream', err);
      })
    })
  }

  connect() {
    var conn = this.peer.connect(this.otherpeerid);
    conn.on('open', function () {
      conn.send('Message from that id');
    });

  }

  videoconnect() {
    // let video = this.elRef.nativeElement.querySelector('video');
    let video = this.myVideo.nativeElement;
    var localvar = this.peer;
    var fname = this.otherpeerid;

    //var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var n = <any>navigator;

    n.getUserMedia = (n.getUserMedia || n.webkitGetUserMedia || n.mozGetUserMedia || n.msGetUserMedia);

    n.getUserMedia({ video: true, audio: true, mediaSource: "screen" }, function (stream) {
      var call = localvar.call(fname, stream);
      call.on('stream', function (remotestream) {
        const mediaStream = new MediaStream(remotestream);
        video.srcObject = mediaStream;
        video.play();
      })
      let recorder = new RecordRTC(stream, {
        type: 'video'
      });
      recorder.startRecording();
      const sleep = m => new Promise(r => setTimeout(r, m));
      sleep(3000);

      recorder.stopRecording();
      recorder.stopRecording(function () {
        let blob = recorder.getBlob();
        //  blob store the video
      });

    }, function (err) {
      console.log('Failed to get stream', err);
    })


  }


  join() {
    this._chatService.joinRoom({ user: 'Aman', room: this.room });
  }

  leave() {
   this.peer.destroy();
    this._chatService.leaveRoom({ user: 'Aman', room: this.room });
  }

  sendMessage() {
    this._chatService.sendMessage({ user: 'Aman', room: this.room, message: this.messageText });
  }

}
