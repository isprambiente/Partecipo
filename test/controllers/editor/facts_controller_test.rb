# frozen_string_literal: true

require 'test_helper'

class Editor::FactsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @editor_fact = editor_facts(:one)
  end

  test 'should get index' do
    get editor_facts_url
    assert_response :success
  end

  test 'should get new' do
    get new_editor_fact_url
    assert_response :success
  end

  test 'should create editor_fact' do
    assert_difference('Editor::Fact.count') do
      post editor_facts_url, params: { editor_fact: { body: @editor_fact.body, start_on: @editor_fact.start_on, stop_on: @editor_fact.stop_on, title: @editor_fact.title } }
    end

    assert_redirected_to editor_fact_url(Editor::Fact.last)
  end

  test 'should show editor_fact' do
    get editor_fact_url(@editor_fact)
    assert_response :success
  end

  test 'should get edit' do
    get edit_editor_fact_url(@editor_fact)
    assert_response :success
  end

  test 'should update editor_fact' do
    patch editor_fact_url(@editor_fact), params: { editor_fact: { body: @editor_fact.body, start_on: @editor_fact.start_on, stop_on: @editor_fact.stop_on, title: @editor_fact.title } }
    assert_redirected_to editor_fact_url(@editor_fact)
  end

  test 'should destroy editor_fact' do
    assert_difference('Editor::Fact.count', -1) do
      delete editor_fact_url(@editor_fact)
    end

    assert_redirected_to editor_facts_url
  end
end
