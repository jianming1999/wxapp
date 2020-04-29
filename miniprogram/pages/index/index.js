//index.js
const app = getApp()

Page({
  data: {
    inputShowed: false,
    inputVal: "",
    musicList: [],
    searchList: []
  },

  onLoad: function() {
    console.log('[onLoad]');
    this.loaded = true;
    if (!wx.cloud) {
      return
    }

    // query db
    let musicList = [];
    try{
      musicList = wx.getStorageSync('musicList') || [];
    }catch(e){}
    if(musicList.length){
      console.log('getStorageSync musicList.length:' + musicList.length);
      this.setData({
        musicList: musicList
      });
    }else{
      const db = wx.cloud.database();
      // 查询当前用户所有的 counters
      db.collection('mp3').get({
        success: res => {
          this.setData({
            musicList: res.data
          });
          try {
            wx.setStorageSync('musicList', res.data);
          } catch (e) { }
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
    }    
    
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('[onShow]');
    if(this.loaded){
      this.hideInput();
      this.onLoad();
    }
  },
  onDeleteCurrent: function(e){
    let mid = e.currentTarget.dataset.mid,
      musicList = this.data.musicList.filter((item) => {
      return item._id !== mid;
    });
    wx.setStorageSync('musicList', musicList);
    this.setData({
      musicList: musicList
    });
  },
  showInput: function () {
      this.setData({
          inputShowed: true
      });
  },
  hideInput: function () {
      this.setData({
          inputVal: "",
          searchList: [],
          inputShowed: false
      });
  },
  clearInput: function () {
      this.setData({
          inputVal: "",
          searchList: []
      });
  },
  inputTyping: function (e) {
      this.setData({
          inputVal: e.detail.value
      });
      if(this.searchTimer){
        clearTimeout(this.searchTimer);        
      }
      this.searchTimer = setTimeout(() => {
        this.searchByKeyword(decodeURIComponent(e.detail.value));
      }, 500);
  },
  searchByKeyword: function(keyword){
    console.log('...searchByKeyword...keyword:' + keyword);
    wx.request({
      url: 'https://songsearch.kugou.com/song_search_v2?keyword='+ (keyword) +'&page=1&pagesize=10&userid=-1&clientver=&platform=WebFilter&tag=em&filter=2&iscorrection=1&privilege_filter=0',
      method: 'get',
      success: (res) => {
        let searchList = res.data && res.data.data && res.data.data.lists;
        if(searchList && searchList.length){
          searchList = searchList.map((item) => {
            return {
              albumID: item.AlbumID,
              albumName: item.AlbumName,
              fileHash: item.FileHash,
              author: this.removeTagHtml(item.SingerName),
              name: this.removeTagHtml(item.SongName),
            };
          });
          this.setData({
            searchList: searchList
          });
        }else{
          wx.showToast({
            title: '没有搜索到结果',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function(){
        wx.showToast({
          title: '出错啦，等下再试',
          icon: 'none',
          duration: 2000
        });
      }
    })
  },
  removeTagHtml: function(str){
    return str.replace(/<\/?\w+\/?>/g,'');
  }

})
