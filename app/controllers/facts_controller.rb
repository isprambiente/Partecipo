# frozen_string_literal: true

# This controller manage the {Fact} model
class FactsController < ApplicationController
  before_action :authenticate_user! if Settings.restricted_access
  before_action :set_fact, only: %i[show]

  # GET /facts
  def index
    @groups = Group.all if ENV['RAILS_GROUP_MENU'] || Settings.group_menu
  end

  # GET /facts/:id
  def show; end

  # GET /facts/list
  def list
    type = filter_params[:type] == 'history' ? 'history' : 'future'
    @text = ['title ilike :text', { text: "%#{filter_params[:text]}%" }] if filter_params[:text].present?
    @group = {group: filter_params[:group]} if filter_params[:group].present?
    @pagy, @facts = pagy(Fact.send(type).where(@text).where(@group), items: 6)
  end

  private

  # set fact when is needed
  def set_fact
    @fact = Fact.find(params[:id])
  end

  # Filter params for facts search
  def filter_params
    params.fetch(:filter, {}).permit(:text, :type, :group)
  end
end
