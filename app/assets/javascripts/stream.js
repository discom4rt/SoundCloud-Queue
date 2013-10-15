SC = SC || {};

// play widgets in a list that are in iframes
SC.Stream = function( $container ) {
  this.$container = $container;
  this.$tracks = this.$container.find('iframe');
  this.setupContinuousPlay();
  this.setupQueuing();
};

SC.Stream.prototype.setupQueuing = function() {
  this.$container.on('click', '.queue-button', function( event ) {
    var $target = $(event.target);
    $target.toggleClass( 'active' );
    SC.Queue.add( $target.prev() );
  });
};

SC.Stream.prototype.setupContinuousPlay = function() {
  this.$tracks.each(function() {
    var $widgetIframe = $(this),
      widget = SC.Widget( $widgetIframe[0] );

    widget.bind(SC.Widget.Events.READY, function() {
      widget.bind(SC.Widget.Events.FINISH, function() {
        var $nextWidgetIframe = $widgetIframe.closest('li').next().find('iframe'),
          nextWidget = SC.Widget( $nextWidgetIframe[0] );
        nextWidget.play();
      });
    });
  });
};

$(function(){
  var stream = new SC.Stream( $('#tracks') );
});