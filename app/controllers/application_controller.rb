class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  before_filter :authenticate

  def index
  end

  private

  def authenticate
    if !session[SessionsController::SC_TOKEN_KEY]
      redirect_to new_session_url
    end
  end
end
