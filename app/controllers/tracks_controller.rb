class TracksController < ApplicationController

  before_filter :authenticate, :init_user
  before_filter :init_soundcloud_from_user, :only => [:update]

  def create
    @track = Track.new(track_params)
    @track.user_id = @user.id

    if @track.save
      head :ok
    else
      head :unprocessable_entity
    end
  end

  # params[:like] or params[:repost] or
  # params[:unlike] or params[:unpost] are present
  def update
    if params.has_key? :like
      @client.put("/me/favorites/#{params[:id]}")
      head :ok and return
    end

    if params.has_key? :unlike
      @client.delete("/me/favorites/#{params[:id]}")
      head :ok and return
    end

    if params.has_key? :repost
      @client.put("/me/track_reposts/#{params[:id]}")
      head :ok and return
    end

    if params.has_key? :unpost
      @client.delete("/me/track_reposts/#{params[:id]}")
      head :ok and return
    end

    head :bad_request
  end

  def destroy
    @track = @user.tracks.where(:track_id => params[:id]).first
    @track.destroy
    render :nothing => true
  end

  def clear
    @user.tracks.destroy_all
    render :nothing => true
  end

  private

  def track_params
    params.require(:track).permit(:track_id)
  end

end
