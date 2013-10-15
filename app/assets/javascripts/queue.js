/* This code is just terrible */
SC.Queue = {
  init: function() {
    this.$list = $('#queue ul');
  },

  add: function( $trackIframe ) {
    var newTrackId = $trackIframe.attr( 'id' ) + '-queued',
     trackSrc = $trackIframe.attr( 'src' ),
     $existingTrack = this.$list.find( '#' + newTrackId ),
     existingTrackWidget,
     $newListItem,
     $newRemoveButton,
     $nextTrack,
     nextTrackWidget,
     $newTrack,
     newTrackWidget,
     $previousTrack,
     previousTrackWidget,
     oldTrackWidget;

    // if the existing track is playing, remove it and play the next track
    // if the existing track is not playing, we assume is somehwere in the queue
    // so we remove it and reset the next track to play after the previous one.
    if( $existingTrack.length ) {
      existingTrackWidget = SC.Widget( $existingTrack[0] );
      $nextTrack = $existingTrack.closest('li').next().find('iframe');
      $previousTrack = $existingTrack.closest('li').prev().find('iframe');

      existingTrackWidget.isPaused(function( isPaused ) {

        if ( $nextTrack.length ) {
          nextTrackWidget = SC.Widget( $nextTrack[0] );

          if( !isPaused ) {
            nextTrackWidget.play();
          } else if( $previousTrack.length ) {
            previousTrackWidget = SC.Widget( $previousTrack[0] );
            previousTrackWidget.unbind(SC.Widget.Events.FINISH);
            previousTrackWidget.bind(SC.Widget.Events.FINISH, function() {
              nextTrackWidget.play();
              $previousTrack.closest('li').remove();
            });
          }
        }

        $existingTrack.closest('li').remove();
      });
    } else {
      $newListItem = $('<li></li>');
      $newRemoveButton = $('<button></button>').attr({
        "class": "dequeue-button button",
        "title": "Remove"
      }).text('Remove');
      $newTrack = $trackIframe.clone().attr({
        'id': newTrackId,
        'src': trackSrc + '?download=false&sharing=false&buying=false&liking=true'
      });
      $newListItem.append( $newTrack );
      $newListItem.append( $newRemoveButton );
      this.$list.append( $newListItem );
      newTrackWidget = SC.Widget( $newTrack[0] );

      newTrackWidget.bind(SC.Widget.Events.READY, function() {

        // I'd love to start the user where they left off
        // but doesn't seem possible unless the sound has been played.
        // newTrackWidget.bind(SC.Widget.Events.PLAY, function(){
        //   oldTrackWidget = SC.Widget( $trackIframe[0] );
        //   oldTrackWidget.getPosition(function( pos ) {
        //     newTrackWidget.seekTo( pos );
        //   });
        // });

        // SET UP PLAY AFTER PREVIOUS TRACK
        $previousTrack = $newTrack.closest('li').prev().find('iframe');
        if( $previousTrack.length ) {
          // presumably, the previous track will have already been loaded
          previousTrackWidget = SC.Widget( $previousTrack[0] );
          previousTrackWidget.unbind(SC.Widget.Events.FINISH);

          previousTrackWidget.bind(SC.Widget.Events.FINISH, function() {
            newTrackWidget.play();
            $previousTrack.closest('li').remove();
          });
        }

        // SOMETHING ELSE
      });
      // deal with playback on the stream
    }
  }
};

$(function() {
  SC.Queue.init();
});