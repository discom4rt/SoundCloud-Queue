SC = SC || {};

// play widgets in a list that are in iframes
SC.Stream = function( $container ) {
  this.TRACK_LENGTH_BOUND = 600000;
  this.TRACK_LENGTH_FILTER_STATES = 3;

  this.$container = $container;
  this.$tracks = this.$container.find('iframe');
  this.$queue = $('#queue');
  this.$filterLengthToggle = $('#track-length-filter');
  this.$absentTracks = null;
  this.isLoadingNext = false;
  this.lengthFilterState = 0;


  this.setupTrackLengthFilter();
  this.setupContinuousPlay( this.$tracks );
  this.setupQueuing();
  this.setupLiking();
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

SC.Stream.prototype.setupTrackLengthFilter = function() {
  var self = this;
  this.$filterLengthToggle.on('click', function( event ) {
    self.lengthFilterState = ++self.lengthFilterState % self.TRACK_LENGTH_FILTER_STATES;
    self.setLengthFilter();
  });
};

SC.Stream.prototype.setLengthFilter = function( event ) {
  var $tracks = this.$container.find('iframe'),
    self = this;

  switch( this.lengthFilterState ) {

    // show all tracks
    case 0:
      $tracks.closest('li').show();
      this.$filterLengthToggle.text('Showing All Tracks');
      break;

    // show only short tracks (<= TRACK_LENGTH_BOUND)
    case 1:
      this.$absentTracks = $tracks.filter(function(index) {
        return parseInt($(this).data('duration'), 10) > self.TRACK_LENGTH_BOUND;
      }).closest('li').hide();
      this.$filterLengthToggle.text('Showing Short Tracks');
      break;

    // show only long tracks (> TRACK_LENGTH_BOUND)
    case 2:
      this.$absentTracks.show();
      $tracks.filter(function(index) {
        return parseInt($(this).data('duration'), 10) <= self.TRACK_LENGTH_BOUND;
      }).closest('li').hide();
      this.$filterLengthToggle.text('Showing Long Tracks');
      break;
  }
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
        var $nextWidgetIframe = $widgetIframe.closest('li').nextAll(':visible').first().find('iframe'),
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
      self.setLengthFilter();
      self.isLoadingNext = false;
    });
  }
};

$(function(){
  var stream = new SC.Stream( $('#tracks') );
});