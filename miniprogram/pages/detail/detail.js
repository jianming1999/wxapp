// miniprogram/pages/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    poster: '',
    name: '',
    author: '',
    src: '',
    sliderVal: 0,
    currentTimeText: '00:00',
    currentTime:0,
    durationText: '00:00',
    duration:0,
    playing: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options,', options);
    let fileHash = options.fileHash,
      albumID = options.albumID,
      mid = options.mid,
      db = wx.cloud.database(),
      data;
    this.currentIndex = 0;
    this.musicList = [];
    if(fileHash && albumID){
      wx.request({
        url: 'https://wwwapi.kugou.com/yy/index.php?r=play/getdata&hash='+ fileHash +'&album_id=' + albumID,
        method: 'get',
        success: (res) => {
          let musicDetail = res.data && res.data.data;
          this.playByData({
            author: musicDetail.author_name,
            name: musicDetail.song_name,
            poster: musicDetail.img,
            src: musicDetail.play_url
          });
        }
      });
    }else if(mid){
      try{
        this.musicList = wx.getStorageSync('musicList');
        console.log(this.musicList);
      }catch(e){}
      
       data = this.musicList.filter((item, index) => {
        if(item._id === mid){
          this.currentIndex = index;
          return true;
        }
       })[0];

      if(!data){
          return;
      }
        
      this.playByData(data);
    }
    
    
      
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio');

    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onPlay
(() => {
      console.log('[onPlay]');
      this.triggerDurationUpdate();
    });
    this.backgroundAudioManager.onCanplay
(() => {
      console.log('[onCanplay]');
      this.triggerDurationUpdate();
    });
    this.backgroundAudioManager.onTimeUpdate(() => {
      this.setData({
        sliderVal: parseInt(this.backgroundAudioManager.currentTime / this.backgroundAudioManager.duration * 100),
        currentTimeText: this.numberFix(parseInt(this.backgroundAudioManager.currentTime)),
        currentTime: this.backgroundAudioManager.currentTime
      });      
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  onSliderChange: function(e){
    let curPointVal = e.detail.value;
    console.log('[onSliderChange]' + curPointVal);
    // this.backgroundAudioManager.pause();
    this.backgroundAudioManager.seek(curPointVal/100 * this.data.duration);
    if (this.backgroundAudioManager.paused){
      this.backgroundAudioManager.play();
    }
  },
  onPlay: function(){
    console.log('[onPlay]');
    this.backgroundAudioManager.play();
    this.setData({
      playing: true
    });
  },
  onPause: function(){
    console.log('[onPause]');
    this.backgroundAudioManager.pause();
    this.setData({
      playing: false
    });
  },
  onPrev: function(){
    let ci = (this.currentIndex - 1);
    if(ci < 0){
      wx.showToast({
        title: '别点了，没有上一首',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if(this.musicList[ci]){
      this.currentIndex = ci;
      this.playByData(this.musicList[ci]);
    }
  },
  onNext: function(){
    let ci = (this.currentIndex + 1);
    if(ci >= this.musicList.length){
      wx.showToast({
        title: '别点了，没有下一首',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if(this.musicList[ci]){
      this.currentIndex = ci;
      this.playByData(this.musicList[ci]);
    }
  },
  playByData: function(data){
    this.setData({
      poster: data.poster,
      name: data.name,
      author: data.author,
      src: data.src,
    });
    console.log('this.audioCtx');
    setTimeout(() => {
      // this.audioCtx.play();
      this.playByOption(this.backgroundAudioManager, data);
      this.setData({
        playing: true
      });
      console.log('[audio] play');
    }, 300);
  },
  playByOption: function(audioContext, options){
    // 歌曲名
    audioContext.title = options.name;
    // 专辑名
    audioContext.epname = options.name;
    // 歌手
    audioContext.singer = options.author;
    // 歌曲封面
    audioContext.coverImgUrl = options.poster;
    // 设置了 src 之后会自动播放
    audioContext.src = options.src;
  },
  triggerDurationUpdate: function(){
    if (this.backgroundAudioManager.duration) {
      this.setData({
        duration: this.backgroundAudioManager.duration,
        durationText: this.numberFix(parseInt(this.backgroundAudioManager.duration))
      });
    }
  },
  tenNum: function(num){
    return Number(num) >= 10 ? (num + '') : ('0' + num);
  },
  numberFix: function(num){
    let minute = parseInt(num / 60);
    let second = num - minute * 60;
    return this.tenNum(minute) + ':' + this.tenNum(second);
  }
})