# frozen_string_literal: true

Rails.application.routes.draw do
  scope "(:locale)", locale: /en|it/ do
    resources :events, only: %i[index show]
    resources :happenings, only: %i[index show]
    resources :tickets, except: %i[edit update]

    namespace "editor" do
      root "events#index"
      resources :events
      resources :happenings do
        get :export, on: :member
      end
      resources :tickets, except: %i[show]
      resources :users, only: %i[index show]
    end

    namespace "admin" do
      root "users#index"
      resources :users, only: %i[index edit update]
      resources :groups, except: %i[show]
      resources :templates
    end
  end
  if RAILS_DEVISE_OMNIAUTHABLE
    devise_for :users, prefix: "auth", controllers: { omniauth_callbacks: "users/omniauth_callbacks" }
  else
    devise_for :users, prefix: "auth"
  end
  unless RAILS_DEVISE_DATABASE_AUTHENTICATABLE
    devise_scope :user do
      get 'sign_in', to: 'devise/sessions#new', as:  :new_user_session
      delete 'sign_out', to: 'devise/sessions#destroy', as: :destroy_user_session
    end
  end
  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  get "/:locale" => "events#index"
  root to: redirect("/it/events") # 'events#index'
end
