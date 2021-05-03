# frozen_string_literal: true

Rails.application.routes.draw do
  get 'home/top_menu'
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
  resources :facts, only: %i[index show] do
    get :list, on: :collection
    resources :happenings, only: %i[index show] do
      resources :tickets, only: %i[create destroy]
    end
  end

  resources :tickets, only: [:index] do
    get :list, on: :collection
  end

  namespace 'editor' do
    root 'facts#index'
    resources :facts do
      get :list, on: :collection
      resources :happenings do
        get :tickets, on: :member, to: 'tickets#list_by_happening'
      end
    end
    resources :tickets do
      get :list, on: :collection
      get :export, on: :collection
    end
    resources :users, only: %i[index show] do
      get :list, on: :collection
      get :tickets, on: :member, to: 'tickets#list_by_user'
    end
  end

  namespace 'admin' do
    root 'users#index'
    resources :users, only: %i[index show edit update] do
      get :list, on: :collection
      resources :tickets, only: %i[index]
    end
    resources :groups do
      get :list, on: :collection
    end
  end

  root 'facts#index'
  devise_for :users, prefix: 'auth'
end
