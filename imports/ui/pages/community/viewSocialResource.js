import './viewSocialResource.html'
import '../comments/commentBody'

import { Template } from 'meteor/templating'
import { socialResources } from '/imports/api/socialResources/socialResources'
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Comments } from '/imports/api/comments/comments'
import { flagProject } from '/imports/api/projects/methods'
import { newComment } from '/imports/api/comments/methods'
import { notify } from '/imports/modules/notifier'
import swal from 'sweetalert2'


Template.viewSocialResourceTemp.onCreated(function() {
	this.autorun(() => {
		this.subscribe('socialResources.item', FlowRouter.getParam('slug'))
		this.subscribe('users')

		let socialResource = socialResources.findOne({
			_id: FlowRouter.getParam('slug')
		})

		if (socialResource) {
			this.subscribe('comments.item', socialResource._id)
		}
	})

	this.coolMessage = new ReactiveVar('')
	this.flagMessage = new ReactiveVar('')
})

Template.viewSocialResourceTemp.helpers({
	tagName: (tag) => tag.name,
	tagUrl: (tag) => `/tags?search=${encodeURIComponent(tag.name)}`,

  isOwner : function() {
    if(this.createdBy === Meteor.userId()){
      return true
    }
    return false
  },
	socialResource: () => socialResources.findOne({
		_id: FlowRouter.getParam('slug')
	}),
	author: function() {
        return ((Meteor.users.findOne({
            _id: this.createdBy
        }) || {}).profile || {}).name || 'No name'
    },
    coolStuff: () => {
    	let socialResource = socialResources.findOne({
			_id: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        	parentId: socialResource._id,
        	type: 'coolstuff'
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
    redFlags: () => {
    	let socialResource = socialResources.findOne({
			_id: FlowRouter.getParam('slug')
		}) || {}

    	return Comments.find({
        	parentId: socialResource._id,
        	type: 'redflag'
    	}, {
    		sort: {
    			createdAt: -1
    		}
    	})
    },
	coolInvalidMessage: () => Template.instance().coolMessage.get(),
	flagInvalidMessage: () => Template.instance().flagMessage.get(),
	coolCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'coolstuff'
		}).count()
	},
	flagCount: function () {
		return Comments.find({
		  	newsId: this._id,
		  	type: 'redflag'
		}).count()
	},
	resourceUrlClass(resourceUrlType) {
		switch(resourceUrlType) {
				case 'TELEGRAM':
					return 'fab fa-telegram';
				case 'FACEBOOK':
					return 'fab fa-facebook';
				case 'TWITTER':
					return 'fab fa-twitter';
				case 'DISCORD':
					return 'fab fa-discord';
				case 'SLACK':
					return 'fab fa-slack';
				case 'GITTER':
					return 'fab fa-gitter';
				default:
					return 'fas fa-globe';
		}
	},
})



Template.viewSocialResourceTemp.events({

'click .new-cool, click .new-flag': (event, templateInstance) => {
  event.preventDefault()
  let socialResource = socialResources.findOne({
    _id: FlowRouter.getParam('slug')
  })

  let cool = $(event.currentTarget).attr('class').includes('cool')

  newComment.call({
    parentId: socialResource._id,
    text: $(`#${cool ? 'cool' : 'flag'}-comment`).val(),
    newsId: socialResource._id,
    type: cool ? 'coolstuff' : 'redflag'
  }, (err, data) => {
        $(`#${cool ? 'cool' : 'flag'}-comment`).val('')

    if (!err) {
      notify('Successfully commented.', 'success')
      templateInstance[`${cool ? 'cool' : 'flag'}Message`].set('')
    } else {
      templateInstance[`${cool ? 'cool' : 'flag'}Message`].set(err.reason || err.message)
    }
  })
}
})
