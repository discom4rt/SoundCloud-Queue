SoundcloudQueue::Application.routes.draw do
  resources :sessions, :only => [:new] do
    get 'create', :on => :collection
  end
  resource :stream, :only => [:show]
  root 'application#index'
end
