# frozen_string_literal: true

# this module contain specific helpers for {HappeningsController}
module HappeningsHelper
  # make the html needed for {Happening} title
  #
  # @param happening [Onject] an {Happening} istance 
  # @return [String] safe html for {happening} title
  def happening_title(happening)
    <<-HTML.html_safe
      <div class="columns is-mobile is-gapless">
        <div class="column">
          <span class="title is-size-5">
            <i class="fas fa-calendar-day"></i>
            #{l happening.start_at, format: :short}
          </span>
        </div>
        <div class="column is-narrow has-text-right">
          <span class="subtitle is-size-6">
            #{happening.seats_count} / #{happening.max_seats}
            <i class="fas fa-chair" aria-hidden="true"></i>
          </span>
        </div>
      </div>
    HTML
  end
end
