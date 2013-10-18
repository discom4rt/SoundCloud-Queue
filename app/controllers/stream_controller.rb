class StreamController < ApplicationController

  before_filter :authenticate, :init_user, :init_soundcloud_from_user

  SC_NEXT_KEY = 'next'

  def show
    @current_user = @client.get('/me')

    if params[:next]
      @stream = @client.get(params[:next])
      render :partial => "tracks", :layout => false and return
    else
      @stream = @client.get('/me/activities')
    end
  end

end
