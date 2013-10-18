SoundcloudQueue::Application.routes.draw do
  resources :sessions, :only => [:new] do
    get 'create', :on => :collection
  end

  resource :stream, :only => [:show], :controller => :stream

  resources :tracks, :only => [:create, :update, :destroy] do
    post 'clear', :on => :collection
  end

  root 'application#index'
end
