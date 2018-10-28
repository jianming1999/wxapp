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
    duration:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options,', options);
    let mid = options.mid;
    let db = wx.cloud.database();
    // 查询当前用户所有的 counters
    db.collection('mp3').where({_id: mid}).get({
      success: res => {
        let data = res.data && res.data[0];
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
          console.log('[audio] play');
        }, 300);
        console.log('[数据库] [查询记录] 成功: ', res)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 使用 wx.createAudioContext 获取 audio 上下文 context
    this.audioCtx = wx.createAudioContext('myAudio');

    this.backgroundAudioManager = wx.getBackgroundAudioManager();
    this.backgroundAudioManager.onCanplay
(() => {
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
    if (this.backgroundAudioManager.duration && this.data.duration === 0) {
      this.setData({
        duration: this.backgroundAudioManager.duration,
        durationText: this.numberFix(parseInt(this.backgroundAudioManager.duration))
      });
    }
  },
  tenNum: function(num){
    return Number(num) > 10 ? (num + '') : ('0' + num);
  },
  numberFix: function(num){
    let minute = parseInt(num / 60);
    let second = num - minute * 60;
    return this.tenNum(minute) + ':' + this.tenNum(second);
  }
})