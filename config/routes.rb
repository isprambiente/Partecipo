# frozen_string_literal: true

Rails.application.routes.draw do
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html

  scope "(:locale)", locale: /en|it/ do
    resources :events, only: %i[index show]
    resources :happenings, only: %i[index show]
    resources :tickets, except: %i[show edit update]

    namespace "editor" do
      root "events#index"
      resources :events do
        get :list, on: :collection
        resources :happenings do
          get :export, on: :member
        end
      end
      resources :happenings
      resources :tickets, except: %i[show]
      resources :users, only: %i[index show]
    end

    namespace "admin" do
      root "users#index"
      resources :users, only: %i[index edit update]
      resources :groups, except: %i[show]
    end
    devise_for :users, prefix: "auth"
  end

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  get "/:locale" => "events#index"
  root to: redirect("/it/events") # 'events#index'
end
