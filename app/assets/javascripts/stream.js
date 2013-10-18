SC = SC || {};

// play widgets in a list that are in iframes
SC.Stream = function( $container ) {
  this.$container = $container;
  this.$tracks = this.$container.find('iframe');
  this.isLoadingNext = false;
  this.setupContinuousPlay( this.$tracks );
  this.setupQueuing();
  this.setupInfiniteScroll();
};

SC.Stream.prototype.setupQueuing = function() {
  this.$container.on('click', '.queue-button', function( event ) {
    var $target = $(event.target);
    $target.toggleClass( 'active' );
    SC.Queue.add( $target.prev() );
  });
};

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