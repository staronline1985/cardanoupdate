import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { Projects } from '/imports/api/projects/projects'
import { Research } from '/imports/api/research/research'
import { updateProfile } from '/imports/api/user/methods'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './viewProfile.html'
import './editProfile.html'
import './userProfile.scss'

import '/imports/ui/shared/uploader/uploader'
import { getFiles } from '/imports/ui/shared/uploader/uploader'

Template.viewProfile.onCreated(function(){
  this.autorun(() => {
    this.subscribe('projects')
    this.subscribe('users')
    this.subscribe('comments')
    this.subscribe('research')
  })
})

Template.viewProfile.helpers({
  user(){
    let user = Meteor.users.findOne({
      _id: FlowRouter.getParam('userId')
    })
    if(user){
      return {
      id : user._id,
      name : user.profile.name ? user.profile.name : 'No Name',
      bio : user.profile.bio ? user.profile.bio : '',
      picture: user.profile.picture || '',
      profile: user.profile,
      emails: user.emails
      // email : user.emails[0].address,
      // verifiedEmail : user.emails[0].verified,
    }
    }
  },
  contentCount(){
    let news = News.find({createdBy : FlowRouter.getParam('userId')}).count()
    let comments = Comments.find({createdBy : FlowRouter.getParam('userId')}).count()

    return news + comments
  },
  userContent(){
    let content = []
    let comments = Comments.find({createdBy : FlowRouter.getParam('userId')})
    if(news){
      news.map(news => {
        content.push({
          isComment : false,
          createdAt : news.createdAt,
          title : news.headline,
          link : news.slug
        })
      })
    }
    if(comments){
      comments.map(comment => {
        content.push({
          isComment : true,
          createdAt : comment.createdAt,
          title : newsTitle(comment.newsId),
          link : newsUrl(comment.newsId, comment._id)
        })
      })
    }
    return content
  },
  comments: () => Comments.find({createdBy : FlowRouter.getParam('userId')}),
  projects: () => Projects.find({createdBy : FlowRouter.getParam('userId')}),
  research: () => Research.find({createdBy : FlowRouter.getParam('userId')})
})

Template.editProfile.onCreated(function(){
  this.autorun(() => {
    this.subscribe('users')
  })
})

Template.editProfile.helpers({
  user(){
    let user = Meteor.users.findOne({_id : Meteor.userId()})
    return {
      name : user.profile.name ? user.profile.name : 'No Name',
      email : user.emails[0].address,
      bio : user.profile.bio ? user.profile.bio : '',
      picture: user.profile.picture || ''
    }
  },
  images: () => {
    let user = Meteor.users.findOne({
      _id : Meteor.userId()
    })

    if (user && user.profile && user.profile.picture) {
      return [user.profile.picture]
    }

    return []
  }
})

Template.editProfile.events({
  'submit #editProfileForm'(event){
    event.preventDefault()
    updateProfile.call({
      uId : Meteor.userId(),
      name : event.target.userName.value,
      email : event.target.userEmail.value,
      bio : event.target.bio.value,
      image: getFiles()[0] || ''
    }, (err, res) => {
      if(err){
        console.log(err)
      }
      history.back()
    })
  },
})


const newsTitle = (newsID) => {
  let news = News.findOne({_id : newsID})
  return news && news.headline || ''
}

const newsUrl = (newsID, commentID) => {
  let news = News.findOne({_id : newsID})
  return news ? `${news.slug}#comment-${commentID}` : ''
}