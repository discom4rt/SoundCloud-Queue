SC = SC || {};

// play widgets in a list that are in iframes
SC.Stream = function( $container ) {
  this.$container = $container;
  this.$tracks = this.$container.find('iframe');
  this.$queue = $('#queue');
  this.$durationSort = $('#duration-sort');
  this.isLoadingNext = false;
  this.sort = 0;

  this.setupContinuousPlay( this.$tracks );
  this.setupQueuing();
  this.setupLiking();
  this.setupDurationSorting();
  // this.setupReposting();
  this.setupInfiniteScroll();
};

SC.Stream.prototype.setupQueuing = function() {
  this.$container.on('click', '.queue-button', function( event ) {
    var $target = $(event.target);
    $target.toggleClass( 'active' );
    SC.Queue.add( $target.prev() );
  });
};

SC.Stream.prototype.setupLiking = function() {
  this.$container.on('click', '.like-button', $.proxy( this.likeOrUnlike, this ));
};

SC.Stream.prototype.setupDurationSorting = function() {
  var self = this;

  this.$durationSort.on('click', function(event) {
    switch( self.sort ) {
      case 0:
        self.$durationSort.addClass('asc');
        self.sort = 1;
        self.sortByDuration();
        break;
      case 1:
        self.$durationSort.removeClass('asc');
        self.$durationSort.addClass('desc');
        self.sort = 2;
        self.sortByDuration();
        
        break;
      case 2:
        self.$durationSort.removeClass('desc');
        self.sort = 0;
        self.unsort();
        break;
    }
  });
};

SC.Stream.prototype.preserveOriginalOrder = function() {

};

SC.Stream.prototype.unsort = function() {

};

SC.Stream.prototype.sortByDuration = function() {
  var list = this.$container.find('li:not(.next)');

  list.sort(this.getDurationComparator()).prependTo(this.$container.find('ul'));
};

SC.Stream.prototype.getDurationComparator = function() {
  var self = this;

  if( this.sort === 2) {
    return function(a, b) {
      return self.durationComparator(b, a);
    };
  }

  return this.durationComparator;
};

SC.Stream.prototype.durationComparator = function(a, b) {
  var aval = parseInt(a.getElementsByTagName('iframe')[0].getAttribute('data-duration'), 10),
    bval = parseInt(b.getElementsByTagName('iframe')[0].getAttribute('data-duration'), 10);

  return aval - bval;
};


// SC.Stream.prototype.setupReposting = function() {
//   var self = this;

//   this.$container.on('click', '.repost-button', function( event ) {
//     var $target = $(event.target);
//     $target.toggleClass('active');
//     self.repostOrUnpost( $target.siblings('iframe').data('track-id'), $target.hasClass('active'), $target);
//   });
// };

SC.Stream.prototype.likeOrUnlike = function ( event ) {
  var $button = $(event.target),
    $track = $button.siblings('iframe'),
    trackId = $track.data('track-id'),
    self = this,
    likeMethod,
    xhr;
  
  $button.toggleClass('active');
  likeMethod = $button.hasClass('active') && 'like' || 'unlike';
  xhr = $.post('/tracks/' + trackId + '?' + likeMethod, { _method: 'patch' });

  xhr.fail(function() {
    $button.toggleClass('active');
    self.$queue.find('[data-track-id=' + trackId + ']').siblings('.like-button').toggleClass('active');
  });

  self.$queue.find('[data-track-id=' + trackId + ']').siblings('.like-button').toggleClass('active');
};

// SC.Stream.prototype.repostOrUnpost = function ( trackId, shouldPost ) {
//   var postMethod = shouldPost && 'repost' || 'unpost';

//   $.post('/tracks/' + trackId + '?' + postMethod, { _method: 'patch' });
//   // change the corresponding queue item
// };

SC.Stream.prototype.setupContinuousPlay = function( $tracks ) {
  var $first = $($tracks[0]),
   $previous = $first.closest('li').prev().find('iframe'),
   firstWidget,
   previousWidget;

  // Play when last section's last song completes
  if( $previous.length && $first.length ) {
    firstWidget = SC.Widget( $first[0] );
    previousWidget = SC.Widget( $previous[0] );

    firstWidget.bind(SC.Widget.Events.READY, function() {
      previousWidget.bind(SC.Widget.Events.FINISH, function() {
        firstWidget.play();
      });
    });
  }

  $tracks.each(function() {
    var $widgetIframe = $(this),
      widget = SC.Widget( $widgetIframe[0] );

    widget.bind(SC.Widget.Events.READY, function() {
      $widgetIframe.siblings('button').css('visibility', 'visible');
      widget.bind(SC.Widget.Events.FINISH, function() {
        var $nextWidgetIframe = $widgetIframe.closest('li').next().find('iframe'),
          nextWidget = SC.Widget( $nextWidgetIframe[0] );
        nextWidget.play();
      });
    });
  });
};

SC.Stream.prototype.setupInfiniteScroll = function() {
  $(window).on( 'scroll', $.proxy( this.loadNext, this ) );
};

SC.Stream.prototype.loadNext = function( event ) {
  var self = this,
    $nextItem;

  if ( $(window).scrollTop() + $(window).height() > $(document).height() - 200 && !this.isLoadingNext ) {
    this.isLoadingNext = true;
    $nextItem = this.$container.find('.next');
    $nextItem.show();

    $.get('stream?next=' + $nextItem.data('next'), function( data ) {
      var $trackItems = $(data);

      $nextItem.replaceWith( $trackItems );
      self.setupContinuousPlay( $trackItems.find( 'iframe' ) );
      self.isLoadingNext = false;
    });
  }
};

$(function(){
  var stream = new SC.Stream( $('#tracks') );
});