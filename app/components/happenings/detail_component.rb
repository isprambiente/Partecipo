# frozen_string_literal: true

module Happenings
  class DetailComponent < CommonComponent
    def initialize(happening:, user: nil)
      @happening = happening
      @user = user
    end
  end
end
