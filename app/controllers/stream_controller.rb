class StreamController < ApplicationController

  before_filter :authenticate, :init_user, :init_soundcloud

  def show
    @current_user = @client.get('/me')
  end

  private

  def init_user
    @user = User.where(:access_token => session[SessionsController::SC_TOKEN_KEY]).first
  end

  def init_soundcloud
    @client = Soundcloud.new(:access_token => @user.access_token)
  end

end
