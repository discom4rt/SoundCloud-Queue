SoundcloudQueue::Application.routes.draw do
  resources :sessions, :only => [:new] do
    get 'create', :on => :collection
  end
  root 'application#index'
end
